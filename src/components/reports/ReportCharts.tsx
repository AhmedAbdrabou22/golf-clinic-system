import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#0f9d78", "#38bdf8", "#fbbf24", "#f87171", "#a78bfa", "#f472b6", "#94a3b8", "#34d399"];

const currencyTick = (v: number) => v.toLocaleString("en-US");

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  height?: number;
}

const ChartCard = ({ title, children, height = 260 }: ChartCardProps) => (
  <div className="card p-4">
    <p className="mb-3 text-sm font-extrabold text-ink">{title}</p>
    <div style={{ width: "100%", height }}>{children}</div>
  </div>
);

const EmptyChart = () => (
  <p className="flex h-full items-center justify-center text-xs text-ink/40">
    لا توجد بيانات كافية لعرض الرسم البياني
  </p>
);

// ================= تقرير الخزنة (daily-safe / shift-safe) =================
const SafeReportCharts = ({ data }: { data: any }) => {
  const t = data?.treasury_summary;
  const shifts: any[] = data?.shifts ?? [];

  const collectionData = t
    ? [
        { name: "كاش", value: t.cash_collected ?? 0 },
        { name: "فيزا/شبكة", value: t.visa_collected ?? 0 },
        { name: "محفظة إلكترونية", value: t.wallet_collected ?? 0 },
        { name: "تأمين", value: t.insurance_collected ?? 0 },
      ].filter((d) => d.value > 0)
    : [];

  const shiftsData = shifts.map((s) => ({
    name: s.employee_name ?? `شفت #${s.shift_id}`,
    "متوقع": s.expected_cash ?? 0,
    "فعلي": s.actual_cash ?? 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="مصادر التحصيل">
        {collectionData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie data={collectionData} dataKey="value" nameKey="name" outerRadius={90} label>
                {collectionData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="الرصيد المتوقع مقابل الفعلي لكل شفت">
        {shiftsData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart data={shiftsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={currencyTick} />
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Legend />
              <Bar dataKey="متوقع" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="فعلي" fill={COLORS[3]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};

// ================= التقرير المالي الشامل (financial-summary) =================
const FinancialSummaryCharts = ({ data }: { data: any }) => {
  const byCategory = data?.income_statement?.revenues?.by_category ?? {};
  const collection = data?.income_statement?.revenues?.collection_breakdown ?? {};
  const cogs = data?.income_statement?.cost_of_supplies_cogs ?? {};
  const expenses = data?.income_statement?.operating_expenses?.total_expenses_amount ?? 0;
  const salaries = data?.income_statement?.payroll_and_salaries?.total_salaries_paid ?? 0;
  const netProfit = data?.income_statement?.net_operating_profit ?? 0;
  const netRevenue = data?.income_statement?.revenues?.net_realized_revenue ?? 0;

  const CATEGORY_LABELS: Record<string, string> = {
    consultations: "كشوفات",
    services: "خدمات",
    devices: "أجهزة",
    direct_sales: "مبيعات مباشرة",
  };

  const categoryData = Object.entries(byCategory)
    .map(([key, v]: [string, any]) => ({ name: CATEGORY_LABELS[key] ?? key, value: v?.revenue ?? 0 }))
    .filter((d) => d.value > 0);

  const collectionData = [
    { name: "كاش", value: collection.cash ?? 0 },
    { name: "فيزا/شبكة", value: collection.visa ?? 0 },
    { name: "محفظة إلكترونية", value: collection.wallet ?? 0 },
    { name: "تأمين", value: collection.insurance ?? 0 },
  ].filter((d) => d.value > 0);

  const bridgeData = [
    { name: "صافي الإيراد", value: netRevenue },
    { name: "تكلفة المستلزمات", value: -(cogs.total_cogs_amount ?? 0) },
    { name: "إجمالي الربح", value: cogs.gross_profit ?? 0 },
    { name: "المصروفات", value: -expenses },
    { name: "الرواتب", value: -salaries },
    { name: "صافي الربح", value: netProfit },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="الإيراد حسب الفئة">
        {categoryData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="طرق التحصيل">
        {collectionData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie data={collectionData} dataKey="value" nameKey="name" outerRadius={90} label>
                {collectionData.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="مسار الربحية (من الإيراد لصافي الربح)" height={300}>
        <ResponsiveContainer>
          <BarChart data={bridgeData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={currencyTick} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => currencyTick(v)} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {bridgeData.map((d, i) => (
                <Cell key={i} fill={d.value >= 0 ? COLORS[0] : COLORS[3]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

// ================= تقرير الأقسام (departments) =================
const DepartmentsCharts = ({ data }: { data: any }) => {
  const departments: any[] = data?.departments ?? [];
  const revenueData = departments
    .map((d) => ({ name: d.department_name, value: d.total_revenue ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const shareData = revenueData.filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="الإيراد حسب القسم">
        {revenueData.every((d) => d.value === 0) ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart data={revenueData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={currencyTick} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Bar dataKey="value" fill={COLORS[0]} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="نسبة مساهمة كل قسم في الإيراد">
        {shareData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie data={shareData} dataKey="value" nameKey="name" outerRadius={90} label>
                {shareData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};

// ================= تقرير الأطباء (doctors) =================
const DoctorsCharts = ({ data }: { data: any }) => {
  const doctors: any[] = data?.doctors ?? [];
  const revenueData = doctors
    .map((d) => ({ name: d.doctor_name, value: d.financial_performance?.total_revenue_generated ?? 0 }))
    .sort((a, b) => b.value - a.value);

  const shareData = doctors.map((d) => ({
    name: d.doctor_name,
    "نصيب العيادة": d.financial_performance?.clinic_net_share ?? 0,
    "عمولة الطبيب": d.financial_performance?.doctor_commission_dues ?? 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="إجمالي الإيراد لكل طبيب">
        {revenueData.every((d) => d.value === 0) ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart data={revenueData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={currencyTick} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Bar dataKey="value" fill={COLORS[0]} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="نصيب العيادة مقابل عمولة الطبيب">
        {shareData.every((d) => d["نصيب العيادة"] === 0 && d["عمولة الطبيب"] === 0) ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart data={shareData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={currencyTick} />
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Legend />
              <Bar dataKey="نصيب العيادة" stackId="a" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="عمولة الطبيب" stackId="a" fill={COLORS[3]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};

// ================= المصروفات والرواتب (expenses-salaries) =================
const ExpensesSalariesCharts = ({ data }: { data: any }) => {
  const byCategory: any[] = data?.expenses_section?.by_category ?? [];
  const expensesData = byCategory
    .map((c) => ({ name: c.category_name, value: c.total_amount ?? 0 }))
    .filter((d) => d.value > 0);

  const comp = data?.salaries_section?.components_breakdown ?? {};
  const SALARY_LABELS: Record<string, string> = {
    basic_salaries: "الرواتب الأساسية",
    service_commissions: "عمولات الخدمات",
    device_commissions: "عمولات الأجهزة",
    product_commissions: "عمولات المنتجات",
    overtime_paid: "الأوفرتايم",
    holiday_allowances_paid: "بدلات الإجازات",
    target_bonuses_paid: "مكافآت التارجت",
  };
  const salaryData = Object.entries(comp)
    .map(([k, v]: [string, any]) => ({ name: SALARY_LABELS[k] ?? k, value: v ?? 0 }))
    .filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="توزيع المصروفات حسب الفئة">
        {expensesData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie data={expensesData} dataKey="value" nameKey="name" outerRadius={90} label>
                {expensesData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="مكوّنات الرواتب المدفوعة">
        {salaryData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart data={salaryData} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={currencyTick} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Bar dataKey="value" fill={COLORS[2]} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};

// ================= سجل الحركات المالية (transactions-ledger) =================
const TransactionsLedgerCharts = ({ data }: { data: any }) => {
  const totals = data?.ledger_totals ?? {};
  const movements: any[] = data?.ledger_movements ?? [];

  const totalsData = [
    { name: "وارد (مدين)", value: totals.total_debits_inflows ?? 0 },
    { name: "منصرف (دائن)", value: totals.total_credits_outflows ?? 0 },
  ];

  const balanceData = movements.map((m) => ({
    name: m.time_formatted ?? m.timestamp,
    الرصيد: m.running_balance ?? 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="إجمالي الوارد مقابل المنصرف">
        {totalsData.every((d) => d.value === 0) ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart data={totalsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={currencyTick} />
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {totalsData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? COLORS[0] : COLORS[3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="تطور الرصيد الجاري">
        {balanceData.length < 2 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <LineChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={currencyTick} />
              <Tooltip formatter={(v: number) => currencyTick(v)} />
              <Line type="monotone" dataKey="الرصيد" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};

// ================= الموزّع الرئيسي =================
interface ReportChartsProps {
  reportKey?: string;
  data: any;
}

const ReportCharts = ({ reportKey, data }: ReportChartsProps) => {
  if (!data) return null;

  switch (reportKey) {
    case "daily-safe":
    case "shift-safe":
      return <SafeReportCharts data={data} />;
    case "financial-summary":
      return <FinancialSummaryCharts data={data} />;
    case "departments":
      return <DepartmentsCharts data={data} />;
    case "doctors":
      return <DoctorsCharts data={data} />;
    case "expenses-salaries":
      return <ExpensesSalariesCharts data={data} />;
    case "transactions-ledger":
      return <TransactionsLedgerCharts data={data} />;
    default:
      return null; // تقرير الأجهزة لسه معندناش شكل Response له
  }
};

export default ReportCharts;