import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import AppointmentStatusMenu from "./AppointmentStatusMenu";
import { VISIT_TYPES, labelOf } from "@/utils/constants";
import type { Appointment } from "@/types";

interface Props {
  appointments: Appointment[];
  isLoading: boolean;
  onEdit: (a: Appointment) => void;
  onDelete: (a: Appointment) => void;
}

const AppointmentsTable = ({ appointments, isLoading, onEdit, onDelete }: Props) => {
  const columns: Column<Appointment>[] = [
    { header: "#", accessor: (r) => r.id },
    {
      header: "المريض",
      accessor: (r) => (
        <span className="font-bold text-ink">{r.patient?.name ?? `#${r.patient_id}`}</span>
      ),
    },
    { header: "الطبيب", accessor: (r) => r.doctor_name ?? r.doctor?.name ?? `#${r.doctor_id}` },
    { header: "الخدمة", accessor: (r) => r.service_name ?? r.service?.name ?? "—" },
    { header: "نوع الزيارة", accessor: (r) => labelOf(VISIT_TYPES, r.visit_type) },
    { header: "الموعد", accessor: (r) => r.appointment_date?.split("T")[0] },
    { header: "الحالة", accessor: (r) => <AppointmentStatusMenu appointment={r} /> },
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
      rows={appointments}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا توجد حجوزات بعد"
      emptyHint="أنشئ أول حجز موعد لمريض."
    />
  );
};

export default AppointmentsTable;