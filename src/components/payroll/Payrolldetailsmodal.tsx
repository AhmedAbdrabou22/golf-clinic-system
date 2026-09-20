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

  const { data, isLoading } = useFetch<ApiEnvelope<any> | any>({
    queryKey: ["payroll-details", payrollId],
    endpoint: `payrolls/${payrollId}`,
    enabled: open && !!payrollId,
  });
  const payroll = (data as ApiEnvelope<any>)?.data ?? (data as Payroll);

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

  // حساب الإجماليات من items لو موجودة
  const additions = payroll?.items
    ?.filter((i) => i.is_addition)
    .reduce((sum, i) => sum + Number(i.amount ?? 0), 0) ?? 0;
  const deductionsTotal = payroll?.items
    ?.filter((i) => !i.is_addition)
    .reduce((sum, i) => sum + Number(i.amount ?? 0), 0) ?? 0;

  return (
    <Modal open={open} onClose={onClose} title="تفاصيل مسير الراتب" width="md">
      {isLoading || !payroll ? (
        <div className="h-40 animate-pulse rounded-xl bg-paper" />
      ) : (
        <div className="flex flex-col gap-5">
          {/* رأس المودال */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-ink">{payroll.user?.name ?? `موظف #${payroll.user_id}`}</p>
              <p className="text-xs text-ink/50">شهر {payroll.month}</p>
            </div>
            <StatusBadge label={labelOf(PAYROLL_STATUSES, payroll.status)} tone={toneOf(PAYROLL_STATUSES, payroll.status)} />
          </div>

          {/* بيانات الموظف */}
          {payroll.user && (
            <div className="card grid grid-cols-2 gap-3 p-4 text-sm">
              <Info label="النوع" value={payroll.user.type} />
              <Info label="البريد" value={payroll.user.email} />
              <Info label="الهاتف" value={payroll.user.phone} />
              <Info label="الراتب الأساسي (العقد)" value={money(payroll.user.basic_salary)} />
            </div>
          )}

          {/* تفنيد البنود */}
          <div className="card divide-y divide-ink/5 p-0">
            {payroll.items && payroll.items.length > 0 ? (
              payroll.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex flex-col">
                    <span className="text-ink/70">{item.description}</span>
                    {item.metadata?.invoice_number && (
                      <span className="text-[10px] text-ink/40">
                        فاتورة: {item.metadata.invoice_number}
                        {item.metadata.service_name ? ` — ${item.metadata.service_name}` : ""}
                      </span>
                    )}
                  </div>
                  <span className={`font-bold ${!item.is_addition ? "text-coral-600" : "text-ink"}`}>
                    {!item.is_addition ? "− " : ""}
                    {money(item.amount)}
                  </span>
                </div>
              ))
            ) : (
              <>
                <Row label="الراتب الأساسي" value={payroll.basic_salary} />
                <Row label="إجمالي العمولات" value={payroll.service_commissions_amount} />
                <Row label="الوقت الإضافي" value={payroll.overtime_amount} />
                <Row label="بدل الإجازات" value={payroll.holiday_allowance_amount} />
                <Row label="بدلات أخرى" value={payroll.other_allowances} />
                <Row label="خصم التأخير" value={payroll.late_deduction_amount} negative />
                <Row label="خصومات يدوية" value={payroll.deductions} negative />
              </>
            )}

            {/* ملخص الإجماليات */}
            <div className="flex items-center justify-between px-4 py-2 text-xs text-ink/50">
              <span>إجمالي الإضافات</span>
              <span className="font-bold text-emerald-600">{money(additions)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2 text-xs text-ink/50">
              <span>إجمالي الخصومات</span>
              <span className="font-bold text-coral-600">{money(deductionsTotal)}</span>
            </div>
            <div className="flex items-center justify-between bg-paper px-4 py-3">
              <span className="font-bold text-ink">صافي الراتب</span>
              <span className="font-display text-lg font-extrabold text-primary-600">{money(payroll.net_salary)}</span>
            </div>
          </div>

          {/* تفاصيل إضافية (اختياري) */}
          <div className="card grid grid-cols-2 gap-3 p-4 text-xs text-ink/60">
            <Info label="عدد الورديات" value={String(payroll.shifts_count ?? 0)} />
            <Info label="ساعات العمل" value={String(payroll.total_working_hours ?? 0)} />
            <Info label="ساعات إضافية" value={String(payroll.overtime_hours ?? 0)} />
            <Info label="دقائق التأخير" value={String(payroll.late_minutes ?? 0)} />
            <Info label="أيام الإجازات" value={String(payroll.holiday_days ?? 0)} />
            <Info label="عدد الخدمات" value={String(payroll.services_count ?? 0)} />
            <Info label="عمولات الأجهزة" value={money(payroll.device_commissions_amount)} />
            <Info label="عمولات المنتجات" value={money(payroll.product_commissions_amount)} />
            <Info label="عمولات القسم" value={money(payroll.department_commissions_amount)} />
            <Info label="الإجمالي قبل الخصم" value={money(payroll.gross_salary)} />
          </div>

          {/* نموذج التعديل */}
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

const Info = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-ink/40">{label}</span>
    <span className="font-medium text-ink">{value ?? "—"}</span>
  </div>
);

export default PayrollDetailsModal;