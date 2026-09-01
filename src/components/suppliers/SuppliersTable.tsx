import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import type { Supplier } from "@/types";

interface Props {
  suppliers: Supplier[];
  isLoading: boolean;
  onEdit: (s: Supplier) => void;
  onDelete: (s: Supplier) => void;
}

const SuppliersTable = ({ suppliers, isLoading, onEdit, onDelete }: Props) => {
  const columns: Column<Supplier>[] = [
    { header: "#", accessor: (r) => r.id },
    { header: "اسم المورد", accessor: (r) => <span className="font-bold text-ink">{r.name}</span> },
    { header: "الهاتف", accessor: (r) => <span dir="ltr">{r.phone ?? "—"}</span> },
    { header: "العنوان", accessor: (r) => r.address ?? "—" },
    {
      header: "إجراءات",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(r)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50">
            <FiEdit2 size={16} />
          </button>
          <button onClick={() => onDelete(r)} className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10">
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={suppliers}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا يوجد موردين بعد"
      emptyHint="أضف أول مورد للتعامل معه في المشتريات."
    />
  );
};

export default SuppliersTable;
