import { FiEye, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { INVOICE_TYPES, PAYMENT_METHODS, labelOf } from "@/utils/constants";
import type { Invoice } from "@/types";

interface Props {
  invoices: Invoice[];
  isLoading: boolean;
  onView: (inv: Invoice) => void;
  onRefund: (inv: Invoice) => void;
  onDelete: (inv: Invoice) => void;
}

const InvoicesTable = ({ invoices, isLoading, onView, onRefund, onDelete }: Props) => {
  const columns: Column<Invoice>[] = [
    { header: "#", accessor: (r) => r.id },
    { header: "المريض", accessor: (r) => <span className="font-bold text-ink">{r.patient?.name ?? `#${r.patient_id}`}</span> },
    { header: "النوع", accessor: (r) => labelOf(INVOICE_TYPES, r.type) },
    { header: "طريقة الدفع", accessor: (r) => labelOf(PAYMENT_METHODS, r.payment_method) },
    {
      header: "الإجمالي",
      accessor: (r) => <span className="font-bold text-primary-600">{r.total ?? "—"} ج.م</span>,
    },
    {
      header: "الحالة",
      accessor: (r) =>
        r.status === "refunded" || r.status === "partial_refund" ? (
          <StatusBadge label={r.status === "refunded" ? "مسترد بالكامل" : "استرداد جزئي"} tone="coral" />
        ) : (
          <StatusBadge label="مدفوعة" tone="primary" />
        ),
    },
    {
      header: "إجراءات",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => onView(r)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" aria-label="عرض">
            <FiEye size={16} />
          </button>
          <button onClick={() => onRefund(r)} className="rounded-lg p-2 text-amber-500 hover:bg-amber-100" aria-label="استرداد">
            <FiRotateCcw size={16} />
          </button>
          <button onClick={() => onDelete(r)} className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10" aria-label="حذف">
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={invoices}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا توجد فواتير بعد"
      emptyHint="أنشئ أول فاتورة كشف أو بيع مباشر."
    />
  );
};

export default InvoicesTable;
