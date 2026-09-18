import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, labelOf, toneOf } from "@/utils/constants";
import type { Expense } from "@/types";

interface Props {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
  startIndex?: number;
}

const ExpensesTable = ({ expenses, isLoading, onEdit, onDelete, startIndex = 1 }: Props) => {
  const columns: Column<Expense>[] = [
    { header: "#", accessor: (_r, index) => startIndex + index },
    { header: "البيان", accessor: (r) => <span className="font-bold text-ink">{r.title}</span> },
    {
      header: "التصنيف",
      accessor: (r) => (
        <StatusBadge
          label={labelOf(EXPENSE_CATEGORIES, r.category)}
          tone={toneOf(EXPENSE_CATEGORIES, r.category)}
        />
      ),
    },
    {
      header: "المبلغ",
      accessor: (r) => (
        <span className="font-bold text-coral-600">{Number(r.amount).toFixed(2)} ج.م</span>
      ),
    },
    { header: "طريقة الدفع", accessor: (r) => labelOf(PAYMENT_METHODS, r.payment_method) },
    { header: "التاريخ", accessor: (r) => r.expense_date },
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
      rows={expenses}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا يوجد مصروفات مسجلة"
      emptyHint="أضف أول مصروف (كهرباء، إيجار، صيانة...) لمتابعة الأرباح والخسائر."
    />
  );
};

export default ExpensesTable;
