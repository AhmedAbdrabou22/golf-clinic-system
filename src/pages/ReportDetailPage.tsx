// import { useMemo, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { FiArrowRight, FiDownload, FiPlay } from "react-icons/fi";
// import useFetch from "@/hooks/useFetch";
// import PageHeader from "@/components/shared/PageHeader";
// import { TextField } from "@/components/shared/FormField";
// import ReportDataView from "@/components/reports/ReportDataView";
// import { REPORTS_LIST } from "@/utils/reports";
// import ReportCharts from "@/components/reports/ReportCharts";

// const todayStr = () => new Date().toISOString().slice(0, 10);
// const firstOfMonthStr = () => {
//     const d = new Date();
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
// };

// const ReportDetailPage = () => {
//     const { key } = useParams<{ key: string }>();
//     const navigate = useNavigate();
//     const config = REPORTS_LIST.find((r) => r.key === key);

//     // ===== قيم الفورم (draft) منفصلة عن القيم المطبَّقة فعليًا على الطلب =====
//     const [draftStart, setDraftStart] = useState(firstOfMonthStr());
//     const [draftEnd, setDraftEnd] = useState(todayStr());
//     const [draftShiftId, setDraftShiftId] = useState("");

//     const [appliedStart, setAppliedStart] = useState(firstOfMonthStr());
//     const [appliedEnd, setAppliedEnd] = useState(todayStr());
//     const [appliedShiftId, setAppliedShiftId] = useState("");

//     const endpoint = useMemo(() => {
//         if (!config) return "";
//         if (config.needsShiftId) return config.endpoint.replace(":shiftId", appliedShiftId || "0");
//         return config.endpoint;
//     }, [config, appliedShiftId]);

//     const params = config?.needsDateRange ? { start_date: appliedStart, end_date: appliedEnd } : undefined;

//     const { data, isLoading } = useFetch<any>({
//         queryKey: ["report", key, appliedStart, appliedEnd, appliedShiftId],
//         endpoint,
//         params,
//         enabled: !!config && (!config.needsShiftId || !!appliedShiftId),
//     });

//     if (!config) {
//         return <p className="text-sm text-ink/50">التقرير غير موجود.</p>;
//     }

//     const reportPayload = data?.data ?? data;

//     const runReport = () => {
//         setAppliedStart(draftStart);
//         setAppliedEnd(draftEnd);
//         setAppliedShiftId(draftShiftId);
//     };

//     const handleExport = () => {
//         const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: "application/json" });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `${config.key}.json`;
//         a.click();
//         URL.revokeObjectURL(url);
//     };

//     return (
//         <div>
//             <PageHeader
//                 title={config.label}
//                 subtitle={config.description}
//                 action={
//                     <div className="flex gap-2">
//                         <button className="btn-secondary" onClick={() => navigate("/reports")}>
//                             <FiArrowRight size={16} /> رجوع للتقارير
//                         </button>
//                         {reportPayload && (
//                             <button className="btn-secondary" onClick={handleExport}>
//                                 <FiDownload size={16} /> تحميل JSON
//                             </button>
//                         )}
//                     </div>
//                 }
//             />

//             {(config.needsDateRange || config.needsShiftId) && (
//                 <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
//                     {config.needsDateRange && (
//                         <>
//                             <TextField
//                                 label="من تاريخ"
//                                 name="start_date"
//                                 type="date"
//                                 value={draftStart}
//                                 onChange={(e) => setDraftStart(e.target.value)}
//                             />
//                             <TextField
//                                 label="إلى تاريخ"
//                                 name="end_date"
//                                 type="date"
//                                 value={draftEnd}
//                                 onChange={(e) => setDraftEnd(e.target.value)}
//                             />
//                         </>
//                     )}
//                     {config.needsShiftId && (
//                         <TextField
//                             label="رقم الشفت"
//                             name="shift_id"
//                             type="number"
//                             value={draftShiftId}
//                             onChange={(e) => setDraftShiftId(e.target.value)}
//                             placeholder="اكتب رقم الشفت"
//                         />
//                     )}
//                     <div className="flex items-end">
//                         <button type="button" className="btn-primary w-full" onClick={runReport}>
//                             <FiPlay size={15} /> تشغيل التقرير
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* <div className="card p-4">
//         {isLoading && <p className="py-8 text-center text-sm text-ink/40">جاري تحميل التقرير...</p>}
//         {!isLoading && !reportPayload && (
//           <p className="py-8 text-center text-sm text-ink/40">
//             {config.needsShiftId && !appliedShiftId ? "اكتب رقم الشفت واضغط تشغيل التقرير" : "لا توجد بيانات"}
//           </p>
//         )}
//         {!isLoading && reportPayload && <ReportDataView data={reportPayload} />}
//       </div> */}
//             {!isLoading && reportPayload && (
//                 <div className="mb-6">
//                     <p className="mb-3 text-sm font-extrabold text-ink">نظرة سريعة</p>
//                     <ReportCharts reportKey={config.key} data={reportPayload} />
//                 </div>
//             )}

//             <div className="card p-4">
//                 {isLoading && <p className="py-8 text-center text-sm text-ink/40">جاري تحميل التقرير...</p>}
//                 {!isLoading && !reportPayload && (
//                     <p className="py-8 text-center text-sm text-ink/40">
//                         {config.needsShiftId && !appliedShiftId ? "اكتب رقم الشفت واضغط تشغيل التقرير" : "لا توجد بيانات"}
//                     </p>
//                 )}
//                 {!isLoading && reportPayload && (
//                     <>
//                         <p className="mb-3 text-sm font-extrabold text-ink">التفاصيل الكاملة</p>
//                         <ReportDataView data={reportPayload} />
//                     </>
//                 )}
//             </div>

//         </div>
//     );
// };

// export default ReportDetailPage;


import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowRight, FiDownload, FiFileText, FiPlay } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import PageHeader from "@/components/shared/PageHeader";
import { TextField } from "@/components/shared/FormField";
import ReportDataView from "@/components/reports/ReportDataView";
import ReportCharts from "@/components/reports/ReportCharts";
import { REPORTS_LIST } from "@/utils/reports";
import { exportReportToExcel } from "@/utils/exportReportExcel";

const todayStr = () => new Date().toISOString().slice(0, 10);
const firstOfMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const ReportDetailPage = () => {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const config = REPORTS_LIST.find((r) => r.key === key);

  const [draftStart, setDraftStart] = useState(firstOfMonthStr());
  const [draftEnd, setDraftEnd] = useState(todayStr());
  const [draftShiftId, setDraftShiftId] = useState("");

  const [appliedStart, setAppliedStart] = useState(firstOfMonthStr());
  const [appliedEnd, setAppliedEnd] = useState(todayStr());
  const [appliedShiftId, setAppliedShiftId] = useState("");

  const endpoint = useMemo(() => {
    if (!config) return "";
    if (config.needsShiftId) return config.endpoint.replace(":shiftId", appliedShiftId || "0");
    return config.endpoint;
  }, [config, appliedShiftId]);

  const params = config?.needsDateRange ? { start_date: appliedStart, end_date: appliedEnd } : undefined;

  const { data, isLoading } = useFetch<any>({
    queryKey: ["report", key, appliedStart, appliedEnd, appliedShiftId],
    endpoint,
    params,
    enabled: !!config && (!config.needsShiftId || !!appliedShiftId),
  });

  if (!config) {
    return <p className="text-sm text-ink/50">التقرير غير موجود.</p>;
  }

  const reportPayload = data?.data ?? data;

  const runReport = () => {
    setAppliedStart(draftStart);
    setAppliedEnd(draftEnd);
    setAppliedShiftId(draftShiftId);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.key}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    exportReportToExcel(config.label, reportPayload);
  };

  return (
    <div>
      <PageHeader
        title={config.label}
        subtitle={config.description}
        action={
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => navigate("/reports")}>
              <FiArrowRight size={16} /> رجوع للتقارير
            </button>
            {reportPayload && (
              <>
                <button className="btn-secondary" onClick={handleExportExcel}>
                  <FiFileText size={16} /> تحميل Excel
                </button>
                <button className="btn-secondary" onClick={handleExportJson}>
                  <FiDownload size={16} /> تحميل JSON
                </button>
              </>
            )}
          </div>
        }
      />

      {(config.needsDateRange || config.needsShiftId) && (
        <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          {config.needsDateRange && (
            <>
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
            </>
          )}
          {config.needsShiftId && (
            <TextField
              label="رقم الشفت"
              name="shift_id"
              type="number"
              value={draftShiftId}
              onChange={(e) => setDraftShiftId(e.target.value)}
              placeholder="اكتب رقم الشفت"
            />
          )}
          <div className="flex items-end">
            <button type="button" className="btn-primary w-full" onClick={runReport}>
              <FiPlay size={15} /> تشغيل التقرير
            </button>
          </div>
        </div>
      )}

      {!isLoading && reportPayload && (
        <div className="mb-6">
          <p className="mb-3 text-sm font-extrabold text-ink">نظرة سريعة</p>
          <ReportCharts reportKey={config.key} data={reportPayload} />
        </div>
      )}

      <div className="card p-4">
        {isLoading && <p className="py-8 text-center text-sm text-ink/40">جاري تحميل التقرير...</p>}
        {!isLoading && !reportPayload && (
          <p className="py-8 text-center text-sm text-ink/40">
            {config.needsShiftId && !appliedShiftId ? "اكتب رقم الشفت واضغط تشغيل التقرير" : "لا توجد بيانات"}
          </p>
        )}
        {!isLoading && reportPayload && (
          <>
            <p className="mb-3 text-sm font-extrabold text-ink">التفاصيل الكاملة</p>
            <ReportDataView data={reportPayload} />
          </>
        )}
      </div>
    </div>
  );
};

export default ReportDetailPage;