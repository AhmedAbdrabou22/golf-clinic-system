import { FiPrinter, FiX } from "react-icons/fi";
import StatusBadge from "@/components/shared/StatusBadge";
import { PAYROLL_STATUSES, labelOf, toneOf } from "@/utils/constants";

interface PayrollItem {
  id: number;
  description: string;
  amount: number;
  is_addition: boolean;
  metadata?: {
    invoice_number?: string;
    service_name?: string;
  } | null;
}

interface PayrollPrintData {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    type?: string;
    basic_salary?: number;
  } | null;
  month: string;
  basic_salary?: number;
  shifts_count?: number;
  total_working_hours?: number;
  hourly_pay?: number;
  overtime_hours?: number;
  overtime_amount?: number;
  late_minutes?: number;
  late_deduction_amount?: number;
  holiday_days?: number;
  holiday_allowance_amount?: number;
  services_count?: number;
  service_commissions_amount?: number;
  device_sessions_count?: number;
  device_commissions_amount?: number;
  product_sales_total?: number;
  product_commissions_amount?: number;
  department_commissions_amount?: number;
  target_bonus_amount?: number;
  other_allowances?: number;
  deductions?: number;
  gross_salary?: number;
  net_salary?: number;
  status?: string;
  approver?: string | null;
  approved_at?: string | null;
  payer?: string | null;
  paid_at?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  items?: PayrollItem[];
  created_at?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  payroll: PayrollPrintData | null;
}

const money = (n?: number | null) => `${Number(n ?? 0).toFixed(2)} ج.م`;

const formatDateTime = (s?: string | null) => {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PayrollPrintModal = ({ open, onClose, payroll }: any) => {
  if (!open || !payroll) return null;

  const additions =
    payroll.items?.filter((i) => i.is_addition).reduce((s, i) => s + Number(i.amount ?? 0), 0) ??
    Number(payroll.gross_salary ?? 0);

  const deductionsTotal =
    payroll.items?.filter((i) => !i.is_addition).reduce((s, i) => s + Number(i.amount ?? 0), 0) ??
    Number(
      (payroll.late_deduction_amount ?? 0) +
        (payroll.deductions ?? 0)
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #payroll-print-area, #payroll-print-area * { visibility: visible; }
          #payroll-print-area {
            position: absolute;
            inset: 0;
            width: 100%;
            padding: 0;
            box-shadow: none;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* أزرار */}
        <div className="no-print flex items-center justify-between border-b border-ink/10 px-5 py-3">
          <h3 className="font-display text-base font-extrabold text-ink">
            مسير راتب جاهز للطباعة
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn-primary !px-3 !py-1.5 text-sm"
            >
              <FiPrinter size={16} /> طباعة
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-ink/50 hover:bg-paper"
              aria-label="إغلاق"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* محتوى الطباعة */}
        <div id="payroll-print-area" className="overflow-y-auto px-6 py-5">
          {/* الهيدر */}
          <div className="mb-4 text-center">
            <p className="font-display text-lg font-extrabold text-ink">
              عيادة الجولف كلينك
            </p>
            <p className="text-xs text-ink/50">
              مسير راتب رقم #{payroll.id} — شهر {payroll.month}
            </p>
            <p className="mt-1 text-[11px] text-ink/40">
              تاريخ الإصدار: {formatDateTime(payroll.created_at)}
            </p>
          </div>

          {/* بيانات الموظف */}
          <div className="mb-4 flex flex-col gap-1 border-y border-dashed border-ink/15 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/50">الموظف</span>
              <span className="font-bold text-ink">
                {payroll.user?.name ?? `موظف #${payroll.user_id}`}
              </span>
            </div>
            {payroll.user?.type && (
              <div className="flex justify-between">
                <span className="text-ink/50">الوظيفة</span>
                <span className="font-bold text-ink">{payroll.user.type}</span>
              </div>
            )}
            {payroll.user?.phone && (
              <div className="flex justify-between">
                <span className="text-ink/50">الهاتف</span>
                <span dir="ltr" className="font-bold text-ink">
                  {payroll.user.phone}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink/50">الشهر</span>
              <span className="font-bold text-ink">{payroll.month}</span>
            </div>
            {payroll.status && (
              <div className="flex items-center justify-between">
                <span className="text-ink/50">الحالة</span>
                <StatusBadge
                  label={labelOf(PAYROLL_STATUSES, payroll.status)}
                  tone={toneOf(PAYROLL_STATUSES, payroll.status)}
                />
              </div>
            )}
          </div>

          {/* تفنيد البنود */}
          <table className="mb-4 w-full text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-right text-xs text-ink/50">
                <th className="pb-1.5 font-bold">البيان</th>
                <th className="pb-1.5 text-left font-bold">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {payroll.items && payroll.items.length > 0 ? (
                payroll.items.map((it) => (
                  <tr key={it.id} className="border-b border-dashed border-ink/10">
                    <td className="py-1.5 text-ink">
                      {it.description}
                      {it.metadata?.invoice_number && (
                        <span className="block text-[10px] text-ink/40">
                          فاتورة: {it.metadata.invoice_number}
                          {it.metadata.service_name
                            ? ` — ${it.metadata.service_name}`
                            : ""}
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-1.5 text-left font-bold ${
                        !it.is_addition ? "text-coral-600" : "text-ink"
                      }`}
                    >
                      {!it.is_addition ? "− " : ""}
                      {money(it.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <PrintRow label="الراتب الأساسي" value={payroll.basic_salary} />
                  <PrintRow
                    label="إجمالي العمولات"
                    value={payroll.service_commissions_amount}
                  />
                  <PrintRow label="الوقت الإضافي" value={payroll.overtime_amount} />
                  <PrintRow
                    label="بدل الإجازات"
                    value={payroll.holiday_allowance_amount}
                  />
                  <PrintRow label="بدلات أخرى" value={payroll.other_allowances} />
                  <PrintRow
                    label="خصم التأخير"
                    value={payroll.late_deduction_amount}
                    negative
                  />
                  <PrintRow
                    label="خصومات يدوية"
                    value={payroll.deductions}
                    negative
                  />
                </>
              )}
            </tbody>
          </table>

          {/* الإجماليات */}
          <div className="mb-4 flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/50">إجمالي الإضافات</span>
              <span className="font-bold text-emerald-600">{money(additions)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/50">إجمالي الخصومات</span>
              <span className="font-bold text-coral-600">
                {money(deductionsTotal)}
              </span>
            </div>
            <div className="flex justify-between border-t border-ink/15 pt-1.5 text-base">
              <span className="font-bold text-ink">صافي الراتب</span>
              <span className="font-extrabold text-primary-600">
                {money(payroll.net_salary)}
              </span>
            </div>
          </div>

          {/* بيانات الصرف */}
          {(payroll.paid_at || payroll.payer || payroll.payment_method) && (
            <div className="mb-4 flex flex-col gap-1 rounded-lg bg-mint-100/60 px-3 py-2 text-xs">
              {payroll.payer && (
                <div className="flex justify-between">
                  <span className="text-ink/50">تم الصرف بواسطة</span>
                  <span className="font-bold text-ink">{payroll.payer}</span>
                </div>
              )}
              {payroll.paid_at && (
                <div className="flex justify-between">
                  <span className="text-ink/50">تاريخ الصرف</span>
                  <span className="font-bold text-ink">
                    {formatDateTime(payroll.paid_at)}
                  </span>
                </div>
              )}
              {payroll.payment_method && (
                <div className="flex justify-between">
                  <span className="text-ink/50">طريقة الدفع</span>
                  <span className="font-bold text-ink">
                    {payroll.payment_method === "cash"
                      ? "نقدي"
                      : payroll.payment_method}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* تفاصيل إضافية */}
          <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink/60">
            <Info label="عدد الورديات" value={String(payroll.shifts_count ?? 0)} />
            <Info
              label="ساعات العمل"
              value={String(payroll.total_working_hours ?? 0)}
            />
            <Info
              label="ساعات إضافية"
              value={String(payroll.overtime_hours ?? 0)}
            />
            <Info
              label="دقائق التأخير"
              value={String(payroll.late_minutes ?? 0)}
            />
            <Info
              label="أيام الإجازات"
              value={String(payroll.holiday_days ?? 0)}
            />
            <Info
              label="عدد الخدمات"
              value={String(payroll.services_count ?? 0)}
            />
          </div>

          {payroll.notes && (
            <p className="mt-4 rounded-lg bg-paper px-3 py-2 text-xs text-ink/60">
              {payroll.notes}
            </p>
          )}

          <p className="mt-6 text-center text-[10px] text-ink/35">
            توقيع المستلم: ................................
          </p>
        </div>

        <div className="no-print border-t border-ink/10 px-5 py-3">
          <button onClick={onClose} className="btn-secondary w-full">
            إغلاق بدون طباعة
          </button>
        </div>
      </div>
    </div>
  );
};

const PrintRow = ({
  label,
  value,
  negative,
}: {
  label: string;
  value?: number | null;
  negative?: boolean;
}) => {
  if (value == null) return null;
  return (
    <tr className="border-b border-dashed border-ink/10">
      <td className="py-1.5 text-ink/70">{label}</td>
      <td
        className={`py-1.5 text-left font-bold ${
          negative ? "text-coral-600" : "text-ink"
        }`}
      >
        {negative ? "− " : ""}
        {money(value)}
      </td>
    </tr>
  );
};

const Info = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex justify-between">
    <span className="text-ink/40">{label}</span>
    <span className="font-medium text-ink">{value ?? "—"}</span>
  </div>
);

export default PayrollPrintModal;