import { useMemo, useState } from "react";
import { FiPlay, FiRefreshCw } from "react-icons/fi";
import PageHeader from "@/components/shared/PageHeader";
import useFetch from "@/hooks/useFetch";
import type { HomeSummaryData, PeriodPreset } from "@/types/homeSummary";

type Department = { id: number; name: string };
type Staff = { id: number; name: string; type: string };

const PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: "today", label: "اليوم" },
  { key: "this_week", label: "هذا الأسبوع" },
  { key: "this_month", label: "هذا الشهر" },
  { key: "last_month", label: "الشهر الماضي" },
  { key: "this_year", label: "هذه السنة" },
  { key: "custom", label: "تاريخ مخصص" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);
const firstOfMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};
const fmt = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

const ReportsDashboardPage = () => {
  const [draftPreset, setDraftPreset] = useState<PeriodPreset>("this_month");
  const [draftStart, setDraftStart] = useState(firstOfMonthStr());
  const [draftEnd, setDraftEnd] = useState(todayStr());
  const [draftDept, setDraftDept] = useState<string>("");
  const [draftDoctor, setDraftDoctor] = useState<string>("");

  const [applied, setApplied] = useState({
    preset: "this_month" as PeriodPreset,
    start: firstOfMonthStr(),
    end: todayStr(),
    department_id: "",
    doctor_id: "",
  });

  // Departments dropdown
  const { data: departmentData } = useFetch<{ data: Department[] }>({
    queryKey: ["departments"],
    endpoint: "departments",
  });
  const departments: Department[] =
    departmentData?.data ?? (Array.isArray(departmentData) ? (departmentData as any) : []);

  // Doctors dropdown
  const { data: staffData } = useFetch<{ data: Staff[] }>({
    queryKey: ["staff"],
    endpoint: "auth/staff",
  });
  const staff: Staff[] =
    staffData?.data ?? (Array.isArray(staffData) ? (staffData as any) : []);
  const doctors = staff.filter((s) => s.type === "doctor");

  // ملاحظة: القسم ممكن يفلتر الأطباء، لكن مش هنعملها هنا لعدم معرفة علاقة الطبيب بالقسم
  // لو عندك حقل department_id في Staff، ضيف فلترة هنا.

  const params = useMemo(() => {
    const p: Record<string, string> = { period_preset: applied.preset };
    if (applied.preset === "custom") {
      p.start_date = applied.start;
      p.end_date = applied.end;
    }
    if (applied.department_id) p.department_id = applied.department_id;
    if (applied.doctor_id) p.doctor_id = applied.doctor_id;
    return p;
  }, [applied]);

  const { data: response, isLoading, isFetching, isError, error, refetch } =
    useFetch<HomeSummaryData>({
      queryKey: ["home-summary", params],
      endpoint: "reports/home-summary",
      params,
      keepPrevious: true,
    });

  const d = response?.data;
  const kpi = d?.executive_kpi_cards;
  const cash = d?.collections_and_safe;
  const inv = d?.inventory_multi_month_clarity;
  const pulse = d?.today_quick_pulse;
  const cats = d?.revenue_by_category ?? {};

  const apply = () =>
    setApplied({
      preset: draftPreset,
      start: draftStart,
      end: draftEnd,
      department_id: draftDept,
      doctor_id: draftDoctor,
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة التحكم الرئيسية"
        subtitle="ملخص تنفيذي شامل لأداء المركز الطبي"
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/60">الفترة</span>
            <select
              value={draftPreset}
              onChange={(e) => setDraftPreset(e.target.value as PeriodPreset)}
              className="input"
            >
              {PRESETS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          {draftPreset === "custom" && (
            <>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-ink/60">من تاريخ</span>
                <input
                  type="date"
                  value={draftStart}
                  onChange={(e) => setDraftStart(e.target.value)}
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-ink/60">إلى تاريخ</span>
                <input
                  type="date"
                  value={draftEnd}
                  onChange={(e) => setDraftEnd(e.target.value)}
                  className="input"
                />
              </label>
            </>
          )}

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/60">القسم (اختياري)</span>
            <select
              value={draftDept}
              onChange={(e) => setDraftDept(e.target.value)}
              className="input"
            >
              <option value="">كل الأقسام</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/60">الطبيب (اختياري)</span>
            <select
              value={draftDoctor}
              onChange={(e) => setDraftDoctor(e.target.value)}
              className="input"
            >
              <option value="">كل الأطباء</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button type="button" className="btn-primary flex-1" onClick={apply}>
              <FiPlay size={15} /> تطبيق
            </button>
            <button
              type="button"
              className="rounded-lg border border-ink/10 px-3 py-2 text-sm hover:bg-ink/5 disabled:opacity-50"
              onClick={() => refetch()}
              disabled={isFetching}
              title="تحديث"
            >
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="card p-6 text-center text-ink/60">جارٍ تحميل البيانات...</div>
      )}
      {isError && (
        <div className="card p-6 text-center text-rose-600">
          خطأ:{" "}
          {(error as any)?.response?.data?.message ||
            (error as any)?.message ||
            "تعذر تحميل البيانات"}
        </div>
      )}

      {d && !isLoading && (
        <>
          <div className="card flex flex-wrap items-center justify-between gap-2 p-4">
            <div>
              <h3 className="text-lg font-extrabold">{d.dashboard_title}</h3>
              <p className="mt-1 text-xs text-ink/50">
                {d.applied_filters.start_date} → {d.applied_filters.end_date}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                kpi?.performance_status === "profit"
                  ? "bg-emerald-50 text-emerald-700"
                  : kpi?.performance_status === "loss"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {kpi?.performance_status === "profit"
                ? "ربح"
                : kpi?.performance_status === "loss"
                ? "خسارة"
                : "تعادل"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KPI
              label="صافي الربح"
              value={`${fmt(kpi?.net_profit)} ج.م`}
              sub={`هامش ${fmt(kpi?.net_profit_margin_percent)}%`}
              color="emerald"
            />
            <KPI
              label="الإيراد المحقق"
              value={`${fmt(kpi?.gross_realized_revenue)} ج.م`}
              sub="Gross realized"
              color="blue"
            />
            <KPI
              label="إجمالي النفقات"
              value={`${fmt(kpi?.total_cash_outflows)} ج.م`}
              sub="Cash outflows"
              color="rose"
            />
            <KPI
              label="صافي التحصيل"
              value={`${fmt(cash?.total_collected)} ج.م`}
              sub={`نسبة التحصيل ${fmt(cash?.collection_rate_percent)}%`}
              color="violet"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KPI label="مرتبات وعمولات" value={`${fmt(kpi?.salaries_and_commissions)} ج.م`} color="amber" />
            <KPI label="تكلفة مستلزمات" value={`${fmt(kpi?.inventory_consumables_cogs)} ج.م`} color="blue" />
            <KPI label="مصروفات تشغيلية" value={`${fmt(kpi?.operating_expenses)} ج.م`} color="rose" />
            <KPI label="مديونية غير محصلة" value={`${fmt(cash?.remaining_uncollected_debt)} ج.م`} color="rose" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card p-4">
              <h4 className="mb-3 font-extrabold">نبض اليوم</h4>
              <Row label="التاريخ" value={pulse?.today_date ?? "-"} />
              <Row label="المواعيد" value={String(pulse?.today_appointments_count ?? 0)} />
              <Row label="الفواتير" value={String(pulse?.today_invoices_count ?? 0)} />
              <Row label="إيراد اليوم" value={`${fmt(pulse?.today_revenue)} ج.م`} />
              <Row label="شيفتات مفتوحة" value={String(pulse?.active_open_shifts_count ?? 0)} />
            </div>

            <div className="card p-4">
              <h4 className="mb-3 font-extrabold">الإيراد حسب الفئة</h4>
              {Object.keys(cats).length === 0 ? (
                <p className="text-xs text-ink/50">لا توجد بيانات</p>
              ) : (
                Object.entries(cats).map(([k, v]) => (
                  <Row key={k} label={CATEGORY_LABELS[k] ?? k} value={`${fmt(v)} ج.م`} />
                ))
              )}
            </div>

            <div className="card p-4">
              <h4 className="mb-3 font-extrabold">المخزون</h4>
              <Row label="قيمة المخزون الحالي" value={`${fmt(inv?.current_total_stock_value)} ج.م`} />
              <Row label="مشتريات الفترة" value={`${fmt(inv?.purchases_during_period)} ج.م`} />
              <Row label="مستهلك بالجلسات" value={`${fmt(inv?.consumed_in_sessions_cogs)} ج.م`} />
              <Row label="الحالة" value={inv?.is_deficit ? "عجز" : "سليم"} />
              {inv?.clarification && (
                <p className="mt-2 text-[11px] leading-5 text-ink/50" dir="rtl">
                  {inv.clarification}
                </p>
              )}
            </div>
          </div>

          <div className="card p-4">
            <h4 className="mb-3 font-extrabold">أعلى الأطباء أداءً</h4>
            {d.top_performing_doctors.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink/50">لا توجد بيانات</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink/5 text-xs text-ink/60">
                    <tr>
                      <th className="px-3 py-2 text-right">الطبيب</th>
                      <th className="px-3 py-2 text-right">القسم</th>
                      <th className="px-3 py-2 text-right">عدد المرضى</th>
                      <th className="px-3 py-2 text-right">الإيراد</th>
                      <th className="px-3 py-2 text-right">العمولات</th>
                      <th className="px-3 py-2 text-right">صافي المركز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.top_performing_doctors.map((doc) => (
                      <tr key={doc.doctor_id} className="border-b border-ink/5">
                        <td className="px-3 py-2 font-semibold">{doc.doctor_name}</td>
                        <td className="px-3 py-2">{doc.department_name}</td>
                        <td className="px-3 py-2">{doc.patients_count}</td>
                        <td className="px-3 py-2">{fmt(doc.gross_revenue)}</td>
                        <td className="px-3 py-2">{fmt(doc.commissions)}</td>
                        <td className="px-3 py-2 font-bold">{fmt(doc.clinic_net_share)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card p-4">
            <h4 className="mb-3 font-extrabold">أعلى الأجهزة ربحية</h4>
            {d.top_profitable_devices.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink/50">لا توجد بيانات</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink/5 text-xs text-ink/60">
                    <tr>
                      <th className="px-3 py-2 text-right">الجهاز</th>
                      <th className="px-3 py-2 text-right">الجلسات</th>
                      <th className="px-3 py-2 text-right">الإيراد</th>
                      <th className="px-3 py-2 text-right">صافي المركز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.top_profitable_devices.map((dev, i) => (
                      <tr key={i} className="border-b border-ink/5">
                        <td className="px-3 py-2 font-semibold">
                          {(dev.device_name as string) ?? "-"}
                        </td>
                        <td className="px-3 py-2">{fmt(dev.sessions_count as number)}</td>
                        <td className="px-3 py-2">{fmt(dev.gross_revenue as number)}</td>
                        <td className="px-3 py-2 font-bold">{fmt(dev.net_share as number)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {isFetching && !isLoading && (
        <p className="text-center text-xs text-primary-600">جارٍ تحديث البيانات...</p>
      )}
    </div>
  );
};

const CATEGORY_LABELS: Record<string, string> = {
  consultations: "الاستشارات",
  services: "الخدمات",
  devices: "الأجهزة",
  direct_sales: "البيع المباشر",
};

function KPI({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-xl p-3 ${map[color] ?? map.blue}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-lg font-extrabold">{value}</div>
      {sub && <div className="text-[11px] opacity-70">{sub}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/5 py-2 text-sm">
      <span className="text-ink/60">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export default ReportsDashboardPage;