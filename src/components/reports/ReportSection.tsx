import useFetch from "@/hooks/useFetch";
import ReportDataView from "@/components/reports/ReportDataView";
import { REPORTS_LIST } from "@/utils/reports";
import { findTable } from "@/utils/findTable";
import type { DashboardSection } from "@/utils/dashboardSections";

interface Props {
  section: DashboardSection;
  startDate: string;
  endDate: string;
}

const ReportSection = ({ section, startDate, endDate }: Props) => {
  const config = REPORTS_LIST.find((r) => r.key === section.reportKey);

  const { data, isLoading } = useFetch<any>({
    queryKey: ["report", section.reportKey, startDate, endDate],
    endpoint: config?.endpoint ?? "",
    params: config?.needsDateRange ? { start_date: startDate, end_date: endDate } : undefined,
    enabled: !!config,
  });

  const payload = data?.data ?? data;
  const { rows, available } = findTable(payload, section.keys);

  return (
    <section className="card p-4">
      <p className="mb-3 text-sm font-extrabold text-ink">{section.title}</p>

      {isLoading && <p className="py-8 text-center text-sm text-ink/40">جاري التحميل...</p>}

      {!isLoading && !config && (
        <p className="py-6 text-center text-sm text-red-500">التقرير غير معرّف: {section.reportKey}</p>
      )}

      {!isLoading && config && rows && <ReportDataView data={rows} />}

      {!isLoading && config && payload && !rows && (
        <p className="py-4 text-center text-xs text-ink/50" dir="ltr">
          Table not found. Available arrays: {available.join(", ") || "none"}
        </p>
      )}
    </section>
  );
};

export default ReportSection;