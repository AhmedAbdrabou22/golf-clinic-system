import { useState } from "react";
import { FiPlay } from "react-icons/fi";
import PageHeader from "@/components/shared/PageHeader";
import { TextField } from "@/components/shared/FormField";
import ReportSection from "@/components/reports/ReportSection";
import { DASHBOARD_SECTIONS } from "@/utils/dashboardSections";

const todayStr = (): string => new Date().toISOString().slice(0, 10);
const firstOfMonthStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const ReportsDashboardPage = () => {
  const [draftStart, setDraftStart] = useState<string>(firstOfMonthStr());
  const [draftEnd, setDraftEnd] = useState<string>(todayStr());
  const [range, setRange] = useState({ start: firstOfMonthStr(), end: todayStr() });

  const apply = () => setRange({ start: draftStart, end: draftEnd });

  return (
    <div>
      <PageHeader
        title="لوحة التقارير"
        subtitle="أهم جداول كل التقارير في صفحة واحدة"
      />

      <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <TextField
          label="من تاريخ"
          name="start_date"
          type="date"
          value={draftStart}
          onChange={(e) => setDraftStart(e.target.value)}
        />
        <TextField
          label="إلى تاريخ"
          name="end_date"
          type="date"
          value={draftEnd}
          onChange={(e) => setDraftEnd(e.target.value)}
        />
        <div className="flex items-end">
          <button type="button" className="btn-primary w-full" onClick={apply}>
            <FiPlay size={15} /> تطبيق
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {DASHBOARD_SECTIONS.map((s) => (
          <ReportSection key={s.id} section={s} startDate={range.start} endDate={range.end} />
        ))}
      </div>
    </div>
  );
};

export default ReportsDashboardPage;