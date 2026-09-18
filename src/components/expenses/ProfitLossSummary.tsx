import { FiTrendingUp, FiTrendingDown, FiActivity } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import { EXPENSE_CATEGORIES, labelOf } from "@/utils/constants";
import type { ApiEnvelope, ExpenseSummary } from "@/types";

interface Props {
  dateFrom: string;
  dateTo: string;
}

const money = (n?: number) => `${Number(n ?? 0).toFixed(2)} ج.م`;

const ProfitLossSummary = ({ dateFrom, dateTo }: Props) => {
  const { data, isLoading } = useFetch<ApiEnvelope<ExpenseSummary> | ExpenseSummary>({
    queryKey: ["expenses-summary"],
    endpoint: "expenses/summary",
    params: { date_from: dateFrom, date_to: dateTo },
    enabled: !!dateFrom && !!dateTo,
  });

  const summary = (data as ApiEnvelope<ExpenseSummary>)?.data ?? (data as ExpenseSummary);

  if (isLoading) {
    return <div className="card h-32 animate-pulse" />;
  }

  const netProfit = summary?.net_profit ?? 0;
  const isProfit = netProfit >= 0;
  const categoryEntries = Object.entries(summary?.expenses_by_category ?? {}) as [string, number][];

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint-100 text-primary-600">
            <FiTrendingUp size={20} />
          </span>
          <div>
            <p className="text-xs font-bold text-ink/45">إجمالي الإيرادات</p>
            <p className="font-display text-lg font-extrabold text-primary-600">
              {money(summary?.total_revenue)}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral-500/10 text-coral-500">
            <FiTrendingDown size={20} />
          </span>
          <div>
            <p className="text-xs font-bold text-ink/45">إجمالي المصروفات</p>
            <p className="font-display text-lg font-extrabold text-coral-600">
              {money(summary?.total_expenses)}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isProfit ? "bg-mint-100 text-primary-600" : "bg-coral-500/10 text-coral-500"
            }`}
          >
            <FiActivity size={20} />
          </span>
          <div>
            <p className="text-xs font-bold text-ink/45">صافي الربح / الخسارة</p>
            <p
              className={`font-display text-lg font-extrabold ${
                isProfit ? "text-primary-600" : "text-coral-600"
              }`}
            >
              {money(netProfit)}
            </p>
          </div>
        </div>
      </div>

      {categoryEntries.length > 0 && (
        <div className="card p-4">
          <p className="mb-3 text-xs font-bold text-ink/45">المصروفات حسب التصنيف</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categoryEntries.map(([category, amount]) => (
              <div key={category} className="rounded-lg bg-paper px-3 py-2.5">
                <p className="text-xs font-bold text-ink/50">{labelOf(EXPENSE_CATEGORIES, category)}</p>
                <p className="mt-0.5 font-bold text-ink">{money(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLossSummary;
