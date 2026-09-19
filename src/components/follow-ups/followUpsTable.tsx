import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { FOLLOW_UP_STATUSES, labelOf, toneOf } from "@/utils/constants";
import type { FollowUp } from "@/types";

interface Props {
  followUps: FollowUp[];
  isLoading: boolean;
  onEdit: (f: FollowUp) => void;
  onDelete: (f: FollowUp) => void;
  startIndex?: number;
}

const FollowUpsTable = ({ followUps, isLoading, onEdit, onDelete, startIndex = 1 }: Props) => {
  const columns: Column<FollowUp>[] = [
    { header: "#", accessor: (_r, index) => startIndex + index },
    {
      header: "المريض",
      accessor: (r) => (
        <span className="font-bold text-ink">{r.patient?.name ?? `#${r.patient_id}`}</span>
      ),
    },
    { header: "الطبيب", accessor: (r) => r.doctor?.name ?? `#${r.doctor_id}` },
    { header: "رقم الحجز المرتبط", accessor: (r) => `#${r.appointment_id}` },
    { header: "موعد المتابعة", accessor: (r) => r.follow_up_date },
    {
      header: "الحالة",
      accessor: (r) => (
        <StatusBadge
          label={labelOf(FOLLOW_UP_STATUSES, r.status)}
          tone={toneOf(FOLLOW_UP_STATUSES, r.status)}
        />
      ),
    },
    { header: "ملاحظات", accessor: (r) => r.notes || "—" },
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
      rows={followUps}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا توجد متابعات بعد"
      emptyHint="أضف أول متابعة لمريض بعد الكشف."
    />
  );
};

export default FollowUpsTable;