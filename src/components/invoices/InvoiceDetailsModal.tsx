import Modal from "@/components/shared/Modal";
import Loader from "@/components/shared/Loader";
import useFetch from "@/hooks/useFetch";
import { INVOICE_TYPES, PAYMENT_METHODS, labelOf } from "@/utils/constants";
import type { Invoice } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  invoiceId: number | null;
}

const InvoiceDetailsModal = ({ open, onClose, invoiceId }: Props) => {
  const { data, isLoading } = useFetch<{ data: Invoice }>({
    queryKey: ["invoice", invoiceId],
    endpoint: `invoices/${invoiceId}`,
    enabled: open && !!invoiceId,
  });

  const invoice = data?.data ?? (data as any);

  return (
    <Modal open={open} onClose={onClose} title={`فاتورة #${invoiceId ?? ""}`} width="md">
      {isLoading || !invoice ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-mint-100 px-4 py-3">
              <p className="text-xs font-bold text-ink/45">المريض</p>
              <p className="mt-0.5 font-bold text-ink">{invoice.patient?.name ?? "—"}</p>
            </div>
            <div className="rounded-lg bg-mint-100 px-4 py-3">
              <p className="text-xs font-bold text-ink/45">النوع</p>
              <p className="mt-0.5 font-bold text-ink">{labelOf(INVOICE_TYPES, invoice.type)}</p>
            </div>
            <div className="rounded-lg bg-mint-100 px-4 py-3">
              <p className="text-xs font-bold text-ink/45">طريقة الدفع</p>
              <p className="mt-0.5 font-bold text-ink">{labelOf(PAYMENT_METHODS, invoice.payment_method)}</p>
            </div>
            <div className="rounded-lg bg-mint-100 px-4 py-3">
              <p className="text-xs font-bold text-ink/45">الإجمالي</p>
              <p className="mt-0.5 font-bold text-primary-600">{invoice.total ?? "—"} ج.م</p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>النوع</th>
                  <th>الكمية</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((it: any, idx: number) => (
                  <tr key={it.id ?? idx}>
                    <td>{it.service?.name ?? it.product?.name ?? "—"}</td>
                    <td>{it.item_type === "service" ? "خدمة" : "منتج"}</td>
                    <td>{it.quantity}</td>
                    <td className="font-bold text-primary-600">{it.total ?? "—"} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invoice.notes && (
            <div className="rounded-lg border border-ink/10 px-4 py-3 text-sm text-ink/70">
              <span className="font-bold text-ink/50">ملاحظات: </span>
              {invoice.notes}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default InvoiceDetailsModal;
