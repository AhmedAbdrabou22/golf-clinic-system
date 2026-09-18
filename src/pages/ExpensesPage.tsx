import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { SelectField, TextField } from "@/components/shared/FormField";
import ProfitLossSummary from "@/components/expenses/ProfitLossSummary";
import ExpensesTable from "@/components/expenses/ExpensesTable";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";
import { EXPENSE_CATEGORIES } from "@/utils/constants";
import type { Expense, PaginatedResponse } from "@/types";

const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const firstOfMonth = () => {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
};

const ExpensesPage = () => {
  const [dateFrom, setDateFrom] = useState(firstOfMonth());
  const [dateTo, setDateTo] = useState(toISODate(new Date()));
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [toDelete, setToDelete] = useState<Expense | null>(null);

  const { data, isLoading } = useFetch<PaginatedResponse<Expense>>({
    queryKey: ["expenses"],
    endpoint: "expenses",
    params: { page, ...(category ? { category } : {}) },
    keepPrevious: true,
  });
  const expenses = data?.data ?? (Array.isArray(data) ? (data as any) : []);
  const meta = (data as any)?.meta;

  const { mutate: deleteExpense, isLoading: deleting } = useMutate({
    endpoint: (e: Expense) => `expenses/${e.id}`,
    method: "delete",
    mutationKey: ["expense-delete"],
    invalidateKeys: [["expenses"], ["expenses-summary"]],
    successMessage: "تم حذف المصروف بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="المصروفات والأرباح والخسائر"
        subtitle="تسجيل المصروفات ومتابعة تقرير الأرباح والخسائر لفترة محددة"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> مصروف جديد
          </button>
        }
      />

      <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <TextField
          label="من تاريخ"
          name="date_from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <TextField
          label="إلى تاريخ"
          name="date_to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <SelectField
          label="فلترة حسب التصنيف"
          name="category"
          placeholder="كل التصنيفات"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          options={EXPENSE_CATEGORIES}
        />
      </div>

      <ProfitLossSummary dateFrom={dateFrom} dateTo={dateTo} />

      <ExpensesTable
        expenses={expenses}
        isLoading={isLoading}
        startIndex={meta?.from ?? 1}
        onEdit={(e) => {
          setSelected(e);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <Pagination meta={meta} onPageChange={setPage} />

      <ExpenseFormModal open={formOpen} onClose={() => setFormOpen(false)} expense={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteExpense(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف مصروف "${toDelete?.title}"؟`}
      />
    </div>
  );
};

export default ExpensesPage;
