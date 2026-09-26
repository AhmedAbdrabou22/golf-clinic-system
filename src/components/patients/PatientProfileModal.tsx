// src/components/patients/PatientProfileModal.tsx
import { useMemo } from "react";
import Modal from "@/components/shared/Modal";
import useFetch from "@/hooks/useFetch";

interface Props {
  open: boolean;
  onClose: () => void;
  patientId: number | null;
}

// ─── helpers ─────────────────────────────────────────────
const fmtMoney = (n: number | string | undefined | null) =>
  n === undefined || n === null || n === "" ? "—" : `${Number(n).toLocaleString("en-US")} ج.م`;

const fmtDate = (s?: string | null) => (s ? s.replace("T", " ").slice(0, 16) : "—");

const genderAr = (p: any) => p?.gender_arabic ?? (p?.gender === "male" ? "ذكر" : "أنثى");

const statusAr = (s?: string) => {
  const map: Record<string, string> = {
    pending: "قيد الانتظار",
    completed: "مكتمل",
    cancelled: "ملغي",
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    partial: "مدفوع جزئيًا",
    settled: "خالص",
    open: "مفتوح",
    closed: "مغلق",
  };
  return s ? map[s] ?? s : "—";
};

const visitTypeAr = (s?: string) => {
  const map: Record<string, string> = {
    consultation: "كشف",
    session: "جلسة",
  };
  return s ? map[s] ?? s : "—";
};

// ─── UI atoms ─────────────────────────────────────────────
const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-gray-100 bg-white">
    <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
      {icon && <span className="text-base">{icon}</span>}
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const Stat = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "success" | "danger" | "warn" | "info";
}) => {
  const toneMap = {
    default: "bg-gray-50 text-gray-800",
    success: "bg-green-50 text-green-700",
    danger: "bg-red-50 text-red-700",
    warn: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700",
  };
  return (
    <div className={`rounded-lg p-3 ${toneMap[tone]}`}>
      <p className="text-[11px] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium text-right">{value ?? "—"}</span>
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <p className="py-4 text-center text-sm text-gray-400">{text}</p>
);

// ─── Main ─────────────────────────────────────────────────
const PatientProfileModal = ({ open, onClose, patientId }: Props) => {
  const { data, isLoading } = useFetch<any>({
    queryKey: ["patient-profile", patientId],
    endpoint: `patients/${patientId}/profile`,
    enabled: open && !!patientId,
  });

  const profile = data?.data;

  const info = profile?.patient_info;
  const fin = profile?.financial_summary;
  const apptSum = profile?.appointments_summary;
  const fuSum = profile?.follow_ups_summary;

  const services: any[] = profile?.purchased_services ?? [];
  const products: any[] = profile?.purchased_products ?? [];
  const appointments: any[] = profile?.appointments ?? [];
  const followUps: any[] = profile?.follow_ups ?? [];
  const invoices: any[] = profile?.invoices ?? [];
  const transactions: any[] = profile?.transactions ?? [];

  // ✅ نسبة الدفع
  const paymentRatio = useMemo(() => {
    if (!fin?.total_billed_amount) return 0;
    return Math.min(
      100,
      Math.round((fin.total_paid_amount / fin.total_billed_amount) * 100)
    );
  }, [fin]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="بروفايل المريض"
      width="lg"
    >
      {isLoading ? (
        <p className="py-10 text-center text-gray-400">جاري التحميل...</p>
      ) : !profile ? (
        <Empty text="لا توجد بيانات" />
      ) : (
        <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pl-1">

          {/* ── بيانات المريض ── */}
          <Section title="بيانات المريض" icon="👤">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Row label="الاسم" value={info?.name} />
              <Row label="رقم الهاتف" value={<span dir="ltr">{info?.phone}</span>} />
              <Row label="النوع" value={genderAr(info)} />
              <Row label="السن" value={info?.age != null ? `${info.age} سنة` : "—"} />
              <Row
                label="من طاقم العمل؟"
                value={
                  info?.is_staff ? (
                    <span className="text-green-600 font-semibold">نعم</span>
                  ) : (
                    "لا"
                  )
                }
              />
              <Row label="أضيف بواسطة" value={info?.creator_name} />
              <Row label="تاريخ التسجيل" value={fmtDate(info?.registered_at)} />
              <Row
                label="منذ"
                value={
                  info?.registered_days_ago != null
                    ? `${info.registered_days_ago} يوم`
                    : "—"
                }
              />
            </div>
          </Section>

          {/* ── الملخص المالي ── */}
          <Section title="الملخص المالي" icon="💰">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="عدد الفواتير" value={fin?.total_invoices_count ?? 0} />
                <Stat label="إجمالي المطلوب" value={fmtMoney(fin?.total_billed_amount)} />
                <Stat
                  label="إجمالي المدفوع"
                  value={fmtMoney(fin?.total_paid_amount)}
                  tone="success"
                />
                <Stat
                  label="المتبقي"
                  value={fmtMoney(fin?.total_remaining_amount)}
                  tone={fin?.total_remaining_amount > 0 ? "danger" : "success"}
                />
                <Stat
                  label="المرتجع"
                  value={fmtMoney(fin?.total_refunded_amount)}
                  tone="warn"
                />
                <Stat
                  label="الخصومات"
                  value={fmtMoney(fin?.total_discount_received)}
                  tone="info"
                />
                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-500 mb-1">حالة الحساب</p>
                  <p className="text-sm font-bold text-gray-800">
                    {fin?.account_status_arabic ?? statusAr(fin?.account_status)}
                  </p>
                </div>
              </div>

              {/* شريط نسبة السداد */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>نسبة السداد</span>
                  <span>{paymentRatio}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${paymentRatio}%` }}
                  />
                </div>
              </div>

              {/* وسائل الدفع */}
              <div>
                <p className="text-xs text-gray-500 mb-2">وسائل الدفع</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Stat label="كاش" value={fmtMoney(fin?.payment_methods_summary?.cash)} />
                  <Stat label="فيزا" value={fmtMoney(fin?.payment_methods_summary?.visa)} />
                  <Stat label="محفظة" value={fmtMoney(fin?.payment_methods_summary?.wallet)} />
                  <Stat
                    label="تأمين"
                    value={fmtMoney(fin?.payment_methods_summary?.insurance)}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* ── ملخص المواعيد ── */}
          <Section title="ملخص المواعيد" icon="📅">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Stat label="الإجمالي" value={apptSum?.total_appointments ?? 0} />
              <Stat
                label="مكتمل"
                value={apptSum?.completed_count ?? 0}
                tone="success"
              />
              <Stat
                label="قيد الانتظار"
                value={apptSum?.pending_count ?? 0}
                tone="warn"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {apptSum?.next_upcoming_appointment && (
                <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                  <p className="text-[11px] text-blue-600 font-semibold mb-1">
                    الموعد القادم
                  </p>
                  <p className="text-sm font-bold">
                    {fmtDate(apptSum.next_upcoming_appointment.appointment_date)}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {apptSum.next_upcoming_appointment.doctor_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {apptSum.next_upcoming_appointment.service_name} ·{" "}
                    {visitTypeAr(apptSum.next_upcoming_appointment.visit_type)}
                  </p>
                </div>
              )}
              {apptSum?.last_completed_appointment && (
                <div className="rounded-lg border border-green-100 bg-green-50/40 p-3">
                  <p className="text-[11px] text-green-700 font-semibold mb-1">
                    آخر موعد مكتمل
                  </p>
                  <p className="text-sm font-bold">
                    {fmtDate(apptSum.last_completed_appointment.appointment_date)}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {apptSum.last_completed_appointment.doctor_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {apptSum.last_completed_appointment.service_name}
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* ── الخدمات المشتراة ── */}
          <Section title="الخدمات المشتراة" icon="💼">
            {services.length === 0 ? (
              <Empty text="لا توجد خدمات" />
            ) : (
              <div className="flex flex-col gap-3">
                {services.map((s) => (
                  <div key={s.service_id} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {s.service_name}
                        </p>
                        <p className="text-xs text-gray-400">{s.department_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">
                          {fmtMoney(s.total_spent)}
                        </p>
                        <p className="text-xs text-gray-400">
                          عدد المرات: {s.times_availed}
                        </p>
                      </div>
                    </div>
                    {s.history?.length > 0 && (
                      <div className="mt-3 border-t border-gray-100 pt-2">
                        <p className="text-[11px] text-gray-500 mb-1">السجل</p>
                        <div className="flex flex-col gap-1.5">
                          {s.history.map((h: any) => (
                            <div
                              key={h.invoice_id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded bg-gray-50 px-2 py-1.5 text-xs"
                            >
                              <span className="text-gray-500" dir="ltr">
                                {h.invoice_number}
                              </span>
                              <span className="text-gray-700">{h.doctor_name}</span>
                              <span className="text-gray-400">{fmtDate(h.date)}</span>
                              <span className="font-semibold">
                                {fmtMoney(h.total_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── المنتجات المشتراة ── */}
          <Section title="المنتجات المشتراة" icon="📦">
            {products.length === 0 ? (
              <Empty text="لا توجد منتجات" />
            ) : (
              <div className="flex flex-col gap-2">
                {products.map((p: any, i: number) => (
                  <div
                    key={p.id ?? i}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
                  >
                    <span>{p.product_name ?? p.name}</span>
                    <span className="font-semibold">
                      {fmtMoney(p.total_spent ?? p.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── المواعيد ── */}
          <Section title="المواعيد" icon="🗓️">
            {appointments.length === 0 ? (
              <Empty text="لا توجد مواعيد" />
            ) : (
              <div className="flex flex-col gap-2">
                {appointments.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg border border-gray-100 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">
                        {a.service_name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          a.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : a.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {statusAr(a.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {a.doctor_name} · {visitTypeAr(a.visit_type)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {fmtDate(a.appointment_date)} · كيو #{a.queue_number}
                    </p>
                    {a.notes && (
                      <p className="mt-1 text-xs text-gray-500 italic">
                        {a.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── المتابعات ── */}
          <Section title="المتابعات" icon="🔁">
            {followUps.length === 0 ? (
              <Empty text="لا توجد متابعات" />
            ) : (
              <div className="flex flex-col gap-2">
                {followUps.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-lg border border-gray-100 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {fmtDate(f.follow_up_date)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          f.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {statusAr(f.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {f.doctor?.name}
                    </p>
                    {f.notes && (
                      <p className="mt-1 text-xs text-gray-500 italic">
                        {f.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── الفواتير ── */}
          <Section title="الفواتير" icon="🧾">
            {invoices.length === 0 ? (
              <Empty text="لا توجد فواتير" />
            ) : (
              <div className="flex flex-col gap-2">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-lg border border-gray-100 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold" dir="ltr">
                        {inv.invoice_number}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          inv.status === "paid"
                            ? "bg-green-50 text-green-700"
                            : inv.status === "partial"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {statusAr(inv.status)}
                      </span>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 text-xs text-gray-500">
                      <span>الإجمالي: {fmtMoney(inv.grand_total)}</span>
                      <span>المدفوع: {fmtMoney(inv.paid_amount)}</span>
                      <span>الخصم: {fmtMoney(inv.discount)}</span>
                      <span>المتبقي: {fmtMoney(inv.remaining_amount)}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {inv.doctor?.name} · {fmtDate(inv.created_at)}
                    </p>

                    {inv.items?.length > 0 && (
                      <div className="mt-2 border-t border-gray-100 pt-2">
                        <p className="text-[11px] text-gray-500 mb-1">العناصر</p>
                        <div className="flex flex-col gap-1">
                          {inv.items.map((it: any) => (
                            <div
                              key={it.id}
                              className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs"
                            >
                              <span>{it.item_name ?? it.service_name}</span>
                              <span className="text-gray-500">
                                ×{it.quantity} · {fmtMoney(it.total_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ── الحركات المالية ── */}
          <Section title="الحركات المالية" icon="💳">
            {transactions.length === 0 ? (
              <Empty text="لا توجد حركات" />
            ) : (
              <div className="flex flex-col gap-2">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-800" dir="ltr">
                        {t.transaction_number}
                      </p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                      <p className="text-[11px] text-gray-400">
                        {t.creator?.name} · {fmtDate(t.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          t.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {fmtMoney(t.amount)}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {t.payment_method === "cash" ? "كاش" : t.payment_method}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

        </div>
      )}
    </Modal>
  );
};

export default PatientProfileModal;