import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import type { Role } from "@/types";

interface Props {
  roles: Role[];
  isLoading: boolean;
  onEdit: (r: Role) => void;
  onDelete: (r: Role) => void;
}

const RolesTable = ({ roles, isLoading, onEdit, onDelete }: Props) => {
  const columns: Column<Role>[] = [
    { header: "#", accessor: (r) => r.id },
    { header: "اسم الدور", accessor: (r) => <span className="font-bold text-ink">{r.name}</span> },
    {
      header: "الصلاحيات",
      accessor: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {(r.permissions ?? []).slice(0, 4).map((p) => (
            <span key={p} className="badge bg-primary-50 text-primary-600">
              {p}
            </span>
          ))}
          {(r.permissions?.length ?? 0) > 4 && (
            <span className="badge bg-ink/5 text-ink/50">+{(r.permissions?.length ?? 0) - 4}</span>
          )}
        </div>
      ),
    },
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
      rows={roles}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا توجد أدوار بعد"
      emptyHint="أضف أول دور وحدد صلاحياته."
    />
  );
};

export default RolesTable;
