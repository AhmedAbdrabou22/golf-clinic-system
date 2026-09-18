import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField, SelectField, TextareaField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/utils/constants";
import type { Expense, ExpenseCategory, PaymentMethod } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  title: "",
  category: "" as ExpenseCategory | "",
  amount: "",
  payment_method: "" as PaymentMethod | "",
  expense_date: todayISO(),
  notes: "",
};

const ExpenseFormModal = ({ open, onClose, expense }: Props) => {
  const isEdit = !!expense;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      setForm({
        title: expense?.title ?? "",
        category: expense?.category ?? "",
        amount: expense ? String(expense.amount) : "",
        payment_method: expense?.payment_method ?? "",
        expense_date: expense?.expense_date ?? todayISO(),
        notes: expense?.notes ?? "",
      });
    }
  }, [open, expense]);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `expenses/${expense?.id}` : "expenses",
    method: isEdit ? "put" : "post",
    mutationKey: ["expense-save"],
    invalidateKeys: [["expenses"], ["expenses-summary"]],
    successMessage: isEdit ? "تم تعديل المصروف بنجاح" : "تم إضافة المصروف بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      payment_method: form.payment_method,
      expense_date: form.expense_date,
      notes: form.notes || null,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل المصروف" : "إضافة مصروف جديد"} width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="البيان"
          name="title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="مثال: فاتورة كهرباء شهر 9"
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="التصنيف"
            name="category"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            options={EXPENSE_CATEGORIES}
          />
          <TextField
            label="المبلغ (ج.م)"
            name="amount"
            type="number"
            step="0.01"
            min={0}
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="طريقة الدفع"
            name="payment_method"
            required
            value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value as PaymentMethod })}
            options={PAYMENT_METHODS}
          />
          <TextField
            label="تاريخ المصروف"
            name="expense_date"
            type="date"
            required
            value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
          />
        </div>
        <TextareaField
          label="ملاحظات"
          name="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="اختياري"
        />
        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseFormModal;
