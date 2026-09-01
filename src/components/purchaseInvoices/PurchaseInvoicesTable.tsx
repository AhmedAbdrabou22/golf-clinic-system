import { FiEye, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import type { PurchaseInvoice } from "@/types";

interface Props {
  invoices: PurchaseInvoice[];
  isLoading: boolean;
  onView: (inv: PurchaseInvoice) => void;
  onDelete: (inv: PurchaseInvoice) => void;
}

const PurchaseInvoicesTable = ({ invoices, isLoading, onView, onDelete }: Props) => {
  const columns: Column<PurchaseInvoice>[] = [
    { header: "#", accessor: (r) => r.id },
    { header: "المورد", accessor: (r) => <span className="font-bold text-ink">{r.supplier?.name ?? "—"}</span> },
    { header: "عدد الأصناف", accessor: (r) => r.items?.length ?? 0 },
    {
      header: "الإجمالي",
      accessor: (r) => (
        <span className="font-bold text-primary-600">
          {r.total ?? r.items?.reduce((s, it) => s + it.quantity * it.purchase_price, 0)} ج.م
        </span>
      ),
    },
    { header: "التاريخ", accessor: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—") },
    {
      header: "إجراءات",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => onView(r)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" aria-label="عرض">
            <FiEye size={16} />
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
      emptyTitle="لا توجد فواتير شراء"
      emptyHint="سجّل أول فاتورة شراء من أحد الموردين."
    />
  );
};

export default PurchaseInvoicesTable;
