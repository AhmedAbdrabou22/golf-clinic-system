import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import Loader from "@/components/shared/Loader";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import type { Invoice } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

const RefundModal = ({ open, onClose, invoice }: Props) => {
  const [isFullRefund, setIsFullRefund] = useState(true);
  const [returnQty, setReturnQty] = useState<Record<number, number>>({});

  const { data, isLoading } = useFetch<{ data: Invoice }>({
    queryKey: ["invoice", invoice?.id],
    endpoint: `invoices/${invoice?.id}`,
    enabled: open && !!invoice,
  });
  const fullInvoice = data?.data ?? (data as any);

  useEffect(() => {
    if (open) {
      setIsFullRefund(true);
      setReturnQty({});
    }
  }, [open]);

  const { mutate, isLoading: submitting } = useMutate({
    endpoint: `invoices/${invoice?.id}/refund`,
    method: "post",
    mutationKey: ["invoice-refund"],
    invalidateKeys: [["invoices"]],
    successMessage: "تم تنفيذ عملية الاسترداد بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFullRefund) {
      mutate({ is_full_refund: true });
      return;
    }
    const items = Object.entries(returnQty)
      .filter(([, qty]) => qty > 0)
      .map(([invoice_item_id, return_quantity]) => ({
        invoice_item_id: Number(invoice_item_id),
        return_quantity,
      }));
    mutate({ is_full_refund: false, items });
  };

  return (
    <Modal open={open} onClose={onClose} title={`استرداد فاتورة #${invoice?.id ?? ""}`} width="md">
      {isLoading || !fullInvoice ? (
        <Loader />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsFullRefund(true)}
              className={isFullRefund ? "btn-primary flex-1" : "btn-secondary flex-1"}
            >
              استرداد كلي
            </button>
            <button
              type="button"
              onClick={() => setIsFullRefund(false)}
              className={!isFullRefund ? "btn-primary flex-1" : "btn-secondary flex-1"}
            >
              استرداد جزئي
            </button>
          </div>

          {!isFullRefund && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>الصنف</th>
                    <th>الكمية بالفاتورة</th>
                    <th>كمية الاسترداد</th>
                  </tr>
                </thead>
                <tbody>
                  {fullInvoice.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td>{it.service?.name ?? it.product?.name ?? "—"}</td>
                      <td>{it.quantity}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={it.quantity}
                          value={returnQty[it.id] ?? 0}
                          onChange={(e) =>
                            setReturnQty({ ...returnQty, [it.id]: Number(e.target.value) })
                          }
                          className="field-input w-24 py-1.5"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-1 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              إلغاء
            </button>
            <button type="submit" disabled={submitting} className="btn-danger flex-1">
              {submitting ? "جاري التنفيذ..." : "تأكيد الاسترداد"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default RefundModal;
