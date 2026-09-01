import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import type { Department } from "@/types";

interface Props {
  departments: Department[];
  isLoading: boolean;
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
}

const DepartmentsTable = ({ departments, isLoading, onEdit, onDelete }: Props) => {
  const columns: Column<Department>[] = [
    { header: "#", accessor: (row) => row.id },
    { header: "اسم القسم", accessor: (row) => <span className="font-bold text-ink">{row.name}</span> },
    {
      header: "إجراءات",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(row)}
            className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
            aria-label="تعديل"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10"
            aria-label="حذف"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={departments}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      emptyTitle="لا توجد أقسام بعد"
      emptyHint="أضف أول قسم في العيادة للبدء."
    />
  );
};

export default DepartmentsTable;
