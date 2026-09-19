import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField, TextareaField } from "@/components/shared/FormField";
import StatusBadge from "@/components/shared/StatusBadge";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import { PAYROLL_STATUSES, labelOf, toneOf } from "@/utils/constants";
import type { ApiEnvelope } from "@/types";
import { Payroll } from "@/utils/contractPayroll";

interface Props {
  open: boolean;
  onClose: () => void;
  payrollId: number | null;
}

const money = (n?: number | null) => `${Number(n ?? 0).toFixed(2)} ج.م`;

const PayrollDetailsModal = ({ open, onClose, payrollId }: Props) => {
  const [form, setForm] = useState({ other_allowances: "", deductions: "", notes: "" });

  const { data, isLoading } = useFetch<ApiEnvelope<Payroll> | Payroll>({
    queryKey: ["payroll-details", payrollId],
    endpoint: `payrolls/${payrollId}`,
    enabled: open && !!payrollId,
  });
  const payroll = (data as ApiEnvelope<Payroll>)?.data ?? (data as Payroll);

  useEffect(() => {
    if (open && payroll) {
      setForm({
        other_allowances: payroll.other_allowances != null ? String(payroll.other_allowances) : "",
        deductions: payroll.deductions != null ? String(payroll.deductions) : "",
        notes: payroll.notes ?? "",
      });
    }
  }, [open, payroll?.id]);

  const { mutate: update, isLoading: saving } = useMutate({
    endpoint: `payrolls/${payrollId}`,
    method: "put",
    mutationKey: ["payroll-update"],
    invalidateKeys: [["payrolls"], ["payroll-details", payrollId]],
    successMessage: "تم تعديل بنود الراتب بنجاح",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    update({
      other_allowances: form.other_allowances ? Number(form.other_allowances) : 0,
      deductions: form.deductions ? Number(form.deductions) : 0,
      notes: form.notes || null,
    });
  };

  const isDraft = payroll?.status === "draft";

  return (
    <Modal open={open} onClose={onClose} title="تفاصيل مسير الراتب" width="md">
      {isLoading || !payroll ? (
        <div className="h-40 animate-pulse rounded-xl bg-paper" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-ink">{payroll.user?.name ?? `موظف #${payroll.user_id}`}</p>
              <p className="text-xs text-ink/50">شهر {payroll.month}</p>
            </div>
            <StatusBadge label={labelOf(PAYROLL_STATUSES, payroll.status)} tone={toneOf(PAYROLL_STATUSES, payroll.status)} />
          </div>

          {/* تفنيد البنود — لو الـ API رجّع items نعرضها، وإلا نعرض الحقول المجمّعة المعروفة */}
          <div className="card divide-y divide-ink/5 p-0">
            {payroll.items && payroll.items.length > 0 ? (
              payroll.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-ink/70">{item.label}</span>
                  <span className={`font-bold ${item.type === "deduction" ? "text-coral-600" : "text-ink"}`}>
                    {item.type === "deduction" ? "− " : ""}
                    {money(item.amount)}
                  </span>
                </div>
              ))
            ) : (
              <>
                <Row label="الراتب الأساسي" value={payroll.base_salary} />
                <Row label="إجمالي العمولات" value={payroll.commissions_total} />
                <Row label="الوقت الإضافي" value={payroll.overtime_total} />
                <Row label="بدل الإجازات" value={payroll.holiday_allowance} />
                <Row label="بدلات أخرى" value={payroll.other_allowances} />
                <Row label="خصم التأخير" value={payroll.late_deduction_total} negative />
                <Row label="خصومات يدوية" value={payroll.deductions} negative />
              </>
            )}
            <div className="flex items-center justify-between bg-paper px-4 py-3">
              <span className="font-bold text-ink">صافي الراتب</span>
              <span className="font-display text-lg font-extrabold text-primary-600">{money(payroll.net_salary)}</span>
            </div>
          </div>

          {isDraft && (
            <form onSubmit={handleSave} className="flex flex-col gap-4 rounded-xl border border-ink/10 p-4">
              <p className="text-xs font-bold text-ink/50">تعديل البدلات أو الخصومات اليدوية</p>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="بدلات أخرى (ج.م)"
                  name="other_allowances"
                  type="number"
                  step="0.01"
                  value={form.other_allowances}
                  onChange={(e) => setForm({ ...form, other_allowances: e.target.value })}
                />
                <TextField
                  label="خصومات يدوية (ج.م)"
                  name="deductions"
                  type="number"
                  step="0.01"
                  value={form.deductions}
                  onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                />
              </div>
              <TextareaField
                label="ملاحظات"
                name="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <button type="submit" disabled={saving} className="btn-primary self-start">
                {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </form>
          )}

          {payroll.notes && !isDraft && (
            <p className="rounded-xl bg-paper p-3 text-sm text-ink/70">{payroll.notes}</p>
          )}
        </div>
      )}
    </Modal>
  );
};

const Row = ({ label, value, negative }: { label: string; value?: number | null; negative?: boolean }) => {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-ink/70">{label}</span>
      <span className={`font-bold ${negative ? "text-coral-600" : "text-ink"}`}>
        {negative ? "− " : ""}
        {money(value)}
      </span>
    </div>
  );
};

export default PayrollDetailsModal;