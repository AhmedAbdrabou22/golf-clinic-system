import Modal from "@/components/shared/Modal";
import Loader from "@/components/shared/Loader";
import useFetch from "@/hooks/useFetch";
import type { PurchaseInvoice } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  invoiceId: number | null;
}

const PurchaseInvoiceDetailsModal = ({ open, onClose, invoiceId }: Props) => {
  const { data, isLoading } = useFetch<{ data: PurchaseInvoice }>({
    queryKey: ["purchase-invoice", invoiceId],
    endpoint: `purchase-invoices/${invoiceId}`,
    enabled: open && !!invoiceId,
  });

  const invoice = data?.data ?? (data as any);

  return (
    <Modal open={open} onClose={onClose} title={`فاتورة شراء #${invoiceId ?? ""}`} width="md">
      {isLoading || !invoice ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between rounded-lg bg-mint-100 px-4 py-3">
            <span className="text-sm font-bold text-ink/60">المورد</span>
            <span className="font-bold text-ink">{invoice.supplier?.name ?? "—"}</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>الكمية</th>
                  <th>سعر الشراء</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((it: any, idx: number) => (
                  <tr key={idx}>
                    <td>{it.item?.name ?? `#${it.item_id}`}</td>
                    <td>{it.quantity}</td>
                    <td>{it.purchase_price} ج.م</td>
                    <td className="font-bold text-primary-600">
                      {it.quantity * it.purchase_price} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PurchaseInvoiceDetailsModal;
