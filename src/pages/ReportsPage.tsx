import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import { REPORTS_LIST } from "@/utils/reports";

const ReportsPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="التقارير المالية والتشغيلية"
        subtitle="تقارير الخزنة، الأرباح، الأقسام، الأطباء، الأجهزة والمصروفات"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS_LIST.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => navigate(`/reports/${r.key}`)}
            className="card flex items-start gap-3 p-4 text-start transition hover:border-primary-200 hover:shadow-soft"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <r.icon size={18} />
            </span>
            <span>
              <span className="block font-extrabold text-ink">{r.label}</span>
              <span className="block text-xs text-ink/50">{r.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;