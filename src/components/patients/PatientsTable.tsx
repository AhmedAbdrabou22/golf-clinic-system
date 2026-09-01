import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { GENDER_OPTIONS, labelOf } from "@/utils/constants";
import type { Patient } from "@/types";

interface Props {
  patients: Patient[];
  isLoading: boolean;
  onEdit: (p: Patient) => void;
  onDelete: (p: Patient) => void;
}

const PatientsTable = ({ patients, isLoading, onEdit, onDelete }: Props) => {
  const columns: Column<Patient>[] = [
    { header: "#", accessor: (r) => r.id },
    { header: "اسم المريض", accessor: (r) => <span className="font-bold text-ink">{r.name}</span> },
    { header: "الهاتف", accessor: (r) => <span dir="ltr">{r.phone}</span> },
    {
      header: "النوع",
      accessor: (r) => (
        <StatusBadge label={labelOf(GENDER_OPTIONS, r.gender)} tone={r.gender === "male" ? "primary" : "coral"} />
      ),
    },
    { header: "السن", accessor: (r) => r.age },
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
      rows={patients}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا يوجد مرضى بعد"
      emptyHint="سجّل أول مريض في العيادة."
    />
  );
};

export default PatientsTable;
