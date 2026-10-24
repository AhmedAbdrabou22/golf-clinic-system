import { useMemo, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { FiCalendar, FiSun, FiMoon } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";

type PeriodMode = "day" | "month" | "shift" | "custom";

type SummaryData = {
  status: number;
  message: string;
  data: {
    report_title: string;
    period: { start_date: string; end_date: string; days_count: number };
    bottom_line_profit: {
      net_profit_amount: number;
      net_profit_margin_percent: number;
      performance_status: string;
      financial_health: string;
      profit_per_day: number;
      profit_per_patient: number;
    };
    income_statement: {
      revenues: {
        gross_invoiced: number;
        discounts_given: number;
        net_invoiced: number;
        refunds_deducted: number;
        net_realized_revenue: number;
        by_category: Record<string, { count: number; revenue: number }>;
        collection_breakdown: Record<string, number>;
      };
      cost_of_supplies_cogs: {
        total_cogs_amount: number;
        gross_profit: number;
        gross_profit_margin_pct: number;
      };
      operating_expenses: { total_expenses_amount: number };
      payroll_and_salaries: { total_salaries_paid: number; payrolls_count: number };
      total_clinic_expenditures: number;
      net_operating_profit: number;
    };
    operational_kpis: {
      total_invoices_issued: number;
      total_unique_patients: number;
      average_invoice_value: number;
      average_revenue_per_day: number;
    };
  };
};

const fmt = (n: number) => Number(n || 0).toLocaleString("en-US");
const toISO = (d: Date) => d.toISOString().slice(0, 10);

const getRange = (mode: PeriodMode, shift: "morning" | "evening") => {
  const now = new Date();
  if (mode === "day" || mode === "shift") {
    const date = toISO(now);
    return { start_date: date, end_date: date, shift };
  }
  if (mode === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start_date: toISO(start), end_date: toISO(end) };
  }
  return { start_date: toISO(now), end_date: toISO(now) };
};

export default function NewFinancialReportPage() {
  const [mode, setMode] = useState<PeriodMode>("month");
  const [shift, setShift] = useState<"morning" | "evening">("morning");
  const [customStart, setCustomStart] = useState(toISO(new Date()));
  const [customEnd, setCustomEnd] = useState(toISO(new Date()));

  const range = useMemo(() => {
    if (mode === "custom") return { start_date: customStart, end_date: customEnd };
    return getRange(mode, shift);
  }, [mode, shift, customStart, customEnd]);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFetch<SummaryData>({
    queryKey: ["financial-summary", range.start_date, range.end_date],
    endpoint: "reports/financial-summary",
    params: { start_date: range.start_date, end_date: range.end_date },
    keepPrevious: true,
  });

  const d = response?.data;
  const revenue = d?.income_statement.revenues;
  const cogs = d?.income_statement.cost_of_supplies_cogs;
  const payroll = d?.income_statement.payroll_and_salaries;
  const kpis = d?.operational_kpis;
  const bottom = d?.bottom_line_profit;

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقرير الإيرادات والمصروفات (الشيفت / اليوم / الشهر)"
        subtitle="اختر الفترة لعرض تحليل مالي شامل"
      />

      {/* شريط الاختيار */}
      <div className="card flex flex-wrap items-center gap-2 p-3">
        {[
          { key: "day", label: "اليوم", icon: <FiCalendar /> },
          { key: "month", label: "الشهر", icon: <FiCalendar /> },
          { key: "shift", label: "شيفت", icon: <FiSun /> },
          { key: "custom", label: "تاريخ مخصص", icon: <FiCalendar /> },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setMode(opt.key as PeriodMode)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === opt.key
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"
            }`}
          >
            {opt.icon} {opt.label}
          </button>
        ))}

        {mode === "shift" && (
          <div className="flex gap-2">
            <button
              onClick={() => setShift("morning")}
              className={`rounded-lg px-3 py-2 text-sm ${
                shift === "morning" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700"
              }`}
            >
              <FiSun className="inline" /> صباحي
            </button>
            <button
              onClick={() => setShift("evening")}
              className={`rounded-lg px-3 py-2 text-sm ${
                shift === "evening" ? "bg-indigo-500 text-white" : "bg-indigo-50 text-indigo-700"
              }`}
            >
              <FiMoon className="inline" /> مسائي
            </button>
          </div>
        )}

        {mode === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="input"
            />
            <span className="text-ink/50">-</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="input"
            />
          </div>
        )}

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="ml-auto rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isFetching ? "جارٍ التحديث..." : "تحديث"}
        </button>
      </div>

      {/* حالة التحميل / الخطأ */}
      {isLoading && <div className="card p-6 text-center text-ink/60">جارٍ تحميل التقرير...</div>}
      {isError && (
        <div className="card p-6 text-center text-rose-600">
          خطأ:{" "}
          {(error as any)?.response?.data?.message ||
            (error as any)?.message ||
            "تعذر تحميل التقرير"}
        </div>
      )}
      {isFetching && !isLoading && (
        <div className="text-xs text-primary-600 text-center">جارٍ تحديث البيانات...</div>
      )}

      {/* النتائج */}
      {d && !isLoading && (
        <>
          <div className="card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-extrabold">{d.report_title}</h3>
              <span className="text-sm text-ink/60">
                من <b>{d.period.start_date}</b> إلى <b>{d.period.end_date}</b>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KPI label="صافي الربح" value={`${fmt(bottom?.net_profit_amount)} ج.م`} color="emerald" />
              <KPI label="إجمالي الإيرادات" value={`${fmt(revenue?.net_realized_revenue)} ج.م`} color="blue" />
              <KPI label="تكلفة المستلزمات" value={`${fmt(cogs?.total_cogs_amount)} ج.م`} color="violet" />
              <KPI label="إجمالي النفقات والرواتب" value={`${fmt(d.income_statement.total_clinic_expenditures)} ج.م`} color="rose" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-4">
              <h4 className="mb-3 font-extrabold">تفصيل الإيرادات</h4>
              <Row label="صافي الفواتير" value={`${fmt(revenue?.net_invoiced)} ج.م`} />
              <Row label="صافي الإيراد المحقق" value={`${fmt(revenue?.net_realized_revenue)} ج.م`} />
              <Row label="المحصل النقدي" value={`${fmt(revenue?.collection_breakdown.cash)} ج.م`} />
              <Row label="غير المحصل" value={`${fmt(revenue?.collection_breakdown.remaining_uncollected)} ج.م`} />
              <Row label="نسبة التحصيل" value={`${revenue?.collection_breakdown.collection_rate_pct ?? 0}%`} />
            </div>
            <div className="card p-4">
              <h4 className="mb-3 font-extrabold">تفصيل المصروفات</h4>
              <Row label="تكلفة المستلزمات" value={`${fmt(cogs?.total_cogs_amount)} ج.م`} />
              <Row label="مجمل الربح" value={`${fmt(cogs?.gross_profit)} ج.م (${cogs?.gross_profit_margin_pct ?? 0}%)`} />
              <Row label="الرواتب" value={`${fmt(payroll?.total_salaries_paid)} ج.م`} />
              <Row label="مصروفات تشغيلية أخرى" value={`${fmt(d.income_statement.operating_expenses.total_expenses_amount)} ج.م`} />
              <Row label="إجمالي النفقات" value={`${fmt(d.income_statement.total_clinic_expenditures)} ج.م`} />
            </div>
          </div>

          <div className="card p-4">
            <h4 className="mb-3 font-extrabold">مؤشرات تشغيلية</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Mini label="الفواتير" value={kpis?.total_invoices_issued} />
              <Mini label="المرضى" value={kpis?.total_unique_patients} />
              <Mini label="متوسط الفاتورة" value={`${fmt(kpis?.average_invoice_value ?? 0)} ج.م`} />
              <Mini label="الإيراد/يوم" value={`${fmt(kpis?.average_revenue_per_day ?? 0)} ج.م`} />
            </div>
          </div>

          <div className="text-xs text-ink/50">
            {d.bottom_line_profit.financial_health} — هامش الربح الصافي {d.bottom_line_profit.net_profit_margin_percent}%
          </div>
        </>
      )}
    </div>
  );
}

/* --- المساعدين زي ما هم --- */
function KPI({ label, value, color }: { label: string; value: string; color: string }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className={`rounded-xl p-3 ${map[color]}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-lg font-extrabold">{value}</div>
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

function Mini({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg bg-ink/5 p-2 text-center">
      <div className="text-xs text-ink/50">{label}</div>
      <div className="text-base font-extrabold">{value ?? "-"}</div>
    </div>
  );
}