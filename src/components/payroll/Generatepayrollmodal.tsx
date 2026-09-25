// import { useEffect, useState } from "react";
// import Modal from "@/components/shared/Modal";
// import { TextField, SelectField, TextareaField } from "@/components/shared/FormField";
// import useFetch from "@/hooks/useFetch";
// import useMutate from "@/hooks/useMutate";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   month: string;
// }

// const emptyForm = {
//   user_id: "",
//   holiday_days: "",
//   other_allowances: "",
//   deductions: "",
//   notes: "",
// };

// // ⚠️ endpoint "staff" مفترض بنفس اسم صفحة الموظفين — تأكد منه لو مختلف عندك
// const GeneratePayrollModal = ({ open, onClose, month }: Props) => {
//   const [form, setForm] = useState(emptyForm);

//   useEffect(() => {
//     if (open) setForm(emptyForm);
//   }, [open]);

//   const { data: staffData } = useFetch<any>({
//     queryKey: ["staff-list"],
//     endpoint: "auth/staff",
//     enabled: open,
//   });
//   const staffList: any[] = staffData?.data ?? (Array.isArray(staffData) ? staffData : []);
//   const staffOptions = staffList.map((s) => ({
//     value: String(s.id),
//     label: s.name ?? s.full_name ?? s.user?.name ?? `موظف #${s.id}`,
//   }));

//   const { mutate, isLoading } = useMutate({
//     endpoint: "payrolls/generate",
//     method: "post",
//     mutationKey: ["payroll-generate"],
//     invalidateKeys: [["payrolls"]],
//     successMessage: "تم توليد الراتب بنجاح",
//     onSuccess: onClose,
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     mutate({
//       user_id: Number(form.user_id),
//       month,
//       holiday_days: form.holiday_days ? Number(form.holiday_days) : undefined,
//       other_allowances: form.other_allowances ? Number(form.other_allowances) : undefined,
//       deductions: form.deductions ? Number(form.deductions) : undefined,
//       notes: form.notes || undefined,
//     });
//   };

//   return (
//     <Modal open={open} onClose={onClose} title="توليد راتب موظف" width="sm">
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <SelectField
//           label="الموظف"
//           name="user_id"
//           required
//           value={form.user_id}
//           onChange={(e) => setForm({ ...form, user_id: e.target.value })}
//           options={staffOptions}
//           placeholder="اختر الموظف"
//         />
//         <TextField label="الشهر" name="month" value={month} onChange={() => {}} disabled />
//         <div className="grid grid-cols-2 gap-4">
//           <TextField
//             label="عدد أيام الإجازة"
//             name="holiday_days"
//             type="number"
//             min={0}
//             value={form.holiday_days}
//             onChange={(e) => setForm({ ...form, holiday_days: e.target.value })}
//           />
//           <TextField
//             label="بدلات أخرى (ج.م)"
//             name="other_allowances"
//             type="number"
//             step="0.01"
//             value={form.other_allowances}
//             onChange={(e) => setForm({ ...form, other_allowances: e.target.value })}
//           />
//         </div>
//         <TextField
//           label="خصومات يدوية (ج.م)"
//           name="deductions"
//           type="number"
//           step="0.01"
//           value={form.deductions}
//           onChange={(e) => setForm({ ...form, deductions: e.target.value })}
//         />
//         <TextareaField
//           label="ملاحظات"
//           name="notes"
//           value={form.notes}
//           onChange={(e) => setForm({ ...form, notes: e.target.value })}
//           placeholder="اختياري"
//         />
//         <div className="mt-2 flex gap-3">
//           <button type="button" onClick={onClose} className="btn-secondary flex-1">
//             إلغاء
//           </button>
//           <button type="submit" disabled={isLoading} className="btn-primary flex-1">
//             {isLoading ? "جاري التوليد..." : "توليد الراتب"}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default GeneratePayrollModal;
import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField, SelectField, TextareaField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";

interface Props {
  open: boolean;
  onClose: () => void;
  month: string;
}

const emptyForm = {
  user_id: "",
  holiday_days: "",
  other_allowances: "",
  deductions: "",
  notes: "",
  start_date: "",
  end_date: "",
};

// ⚠️ endpoint "staff" مفترض بنفس اسم صفحة الموظفين — تأكد منه لو مختلف عندك
const GeneratePayrollModal = ({ open, onClose, month }: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [periodMode, setPeriodMode] = useState<"month" | "range">("month");

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setPeriodMode("month");
    }
  }, [open]);

  const { data: staffData } = useFetch<any>({
    queryKey: ["staff-list"],
    endpoint: "auth/staff",
    enabled: open,
  });
  const staffList: any[] =
    staffData?.data ?? (Array.isArray(staffData) ? staffData : []);
  const staffOptions = staffList.map((s) => ({
    value: String(s.id),
    label: s.name ?? s.full_name ?? s.user?.name ?? `موظف #${s.id}`,
  }));

  const { mutate, isLoading } = useMutate({
    endpoint: "payrolls/generate",
    method: "post",
    mutationKey: ["payroll-generate"],
    invalidateKeys: [["payrolls"]],
    successMessage: "تم توليد الراتب بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ بناء payload الأساسي
    const payload: Record<string, any> = {
      user_id: Number(form.user_id),
      holiday_days: form.holiday_days ? Number(form.holiday_days) : undefined,
      other_allowances: form.other_allowances
        ? Number(form.other_allowances)
        : undefined,
      deductions: form.deductions ? Number(form.deductions) : undefined,
      notes: form.notes || undefined,
    };

    // ✅ حسب الوضع المختار: شهر كامل أو فترة مخصصة
    if (periodMode === "range") {
      if (!form.start_date || !form.end_date) return;
      payload.start_date = form.start_date;
      payload.end_date = form.end_date;
    } else {
      payload.month = month;
    }

    mutate(payload);
  };

  const isRangeValid =
    periodMode === "month" ||
    (!!form.start_date && !!form.end_date && form.start_date <= form.end_date);

  return (
    <Modal open={open} onClose={onClose} title="توليد راتب موظف" width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectField
          label="الموظف"
          name="user_id"
          required
          value={form.user_id}
          onChange={(e) => setForm({ ...form, user_id: e.target.value })}
          options={staffOptions}
          placeholder="اختر الموظف"
        />

        {/* ✅ اختيار نوع الفترة */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="periodMode"
              checked={periodMode === "month"}
              onChange={() => setPeriodMode("month")}
            />
            شهر كامل
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="periodMode"
              checked={periodMode === "range"}
              onChange={() => setPeriodMode("range")}
            />
            فترة مخصصة
          </label>
        </div>

        {periodMode === "month" ? (
          <TextField
            label="الشهر"
            name="month"
            value={month}
            onChange={() => {}}
            disabled
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="من تاريخ"
              name="start_date"
              type="date"
              required
              value={form.start_date}
              onChange={(e) =>
                setForm({ ...form, start_date: e.target.value })
              }
            />
            <TextField
              label="إلى تاريخ"
              name="end_date"
              type="date"
              required
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="عدد أيام الإجازة"
            name="holiday_days"
            type="number"
            min={0}
            value={form.holiday_days}
            onChange={(e) =>
              setForm({ ...form, holiday_days: e.target.value })
            }
          />
          <TextField
            label="بدلات أخرى (ج.م)"
            name="other_allowances"
            type="number"
            step="0.01"
            value={form.other_allowances}
            onChange={(e) =>
              setForm({ ...form, other_allowances: e.target.value })
            }
          />
        </div>

        <TextField
          label="خصومات يدوية (ج.م)"
          name="deductions"
          type="number"
          step="0.01"
          value={form.deductions}
          onChange={(e) => setForm({ ...form, deductions: e.target.value })}
        />

        <TextareaField
          label="ملاحظات"
          name="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="اختياري"
        />

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading || !isRangeValid}
            className="btn-primary flex-1"
          >
            {isLoading ? "جاري التوليد..." : "توليد الراتب"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GeneratePayrollModal;