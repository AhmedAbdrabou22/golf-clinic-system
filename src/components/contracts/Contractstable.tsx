import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { CONTRACT_TYPES, labelOf, toneOf } from "@/utils/constants";
import { Contract } from "@/utils/contractPayroll";

interface Props {
  contracts: Contract[];
  isLoading: boolean;
  onEdit: (c: Contract) => void;
  onDelete: (c: Contract) => void;
  startIndex?: number;
}

const ContractsTable = ({ contracts, isLoading, onEdit, onDelete, startIndex = 1 }: Props) => {
  const columns: Column<Contract>[] = [
    { header: "#", accessor: (_r, index) => startIndex + index },
    {
      header: "الموظف",
      accessor: (r) => (
        <span className="font-bold text-ink">{r.user?.name ?? `موظف #${r.user_id}`}</span>
      ),
    },
    { header: "عنوان العقد", accessor: (r) => r.title },
    {
      header: "نوع العقد",
      accessor: (r) => (
        <StatusBadge
          label={labelOf(CONTRACT_TYPES, r.contract_type)}
          tone={toneOf(CONTRACT_TYPES, r.contract_type)}
        />
      ),
    },
    {
      header: "الحالة",
      accessor: (r) => (
        <StatusBadge
          label={r.is_active ? "فعال" : "موقوف"}
          tone={r.is_active ? "primary" : "gray"}
        />
      ),
    },
    { header: "ملاحظات", accessor: (r) => r.notes ?? "—" },
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
      rows={contracts}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا يوجد عقود مسجلة"
      emptyHint="أضف أول عقد عمولات لأحد الموظفين لبدء احتساب الرواتب تلقائيًا."
    />
  );
};

export default ContractsTable;