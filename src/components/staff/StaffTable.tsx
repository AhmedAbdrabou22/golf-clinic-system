import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { STAFF_TYPES, labelOf } from "@/utils/constants";
import type { Staff } from "@/types";

interface Props {
  staff: Staff[];
  isLoading: boolean;
  onEdit: (s: Staff) => void;
  onDelete: (s: Staff) => void;
}

const StaffTable = ({ staff, isLoading, onEdit, onDelete }: Props) => {
  const columns: Column<Staff>[] = [
    { header: "#", accessor: (r) => r.id },
    { header: "الاسم", accessor: (r) => <span className="font-bold text-ink">{r.name}</span> },
    { header: "الهاتف", accessor: (r) => <span dir="ltr">{r.phone}</span> },
    { header: "الوظيفة", accessor: (r) => labelOf(STAFF_TYPES, r.type) },
    { header: "القسم", accessor: (r) => r.department?.name ?? "—" },
    {
      header: "الحالة",
      accessor: (r) =>
        r.is_active ? (
          <StatusBadge label="نشط" tone="primary" />
        ) : (
          <StatusBadge label="غير نشط" tone="gray" />
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
      rows={staff}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا يوجد موظفين بعد"
      emptyHint="أضف أول موظف بالعيادة."
    />
  );
};

export default StaffTable;
