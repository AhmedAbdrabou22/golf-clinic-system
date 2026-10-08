

// import { useState } from "react";
// import { FiPlus, FiZap } from "react-icons/fi";
// import { toast } from "react-toastify";
// import useFetch from "@/hooks/useFetch";
// import useMutate from "@/hooks/useMutate";
// import PageHeader from "@/components/shared/PageHeader";
// import ConfirmDialog from "@/components/shared/ConfirmDialog";
// import Pagination from "@/components/shared/Pagination";
// import { TextField } from "@/components/shared/FormField";
// import type { PaginatedResponse } from "@/types";
// import PayrollsTable from "@/components/payroll/Payrollstable";
// import { Payroll } from "@/utils/contractPayroll";
// import GeneratePayrollModal from "@/components/payroll/Generatepayrollmodal";
// import PayrollDetailsModal from "@/components/payroll/Payrolldetailsmodal";
// import PayPayrollModal from "@/components/payroll/Paypayrollmodal";
// import PayrollPrintModal from "@/components/payroll/PayrollPrintModal";

// const currentMonth = () => new Date().toISOString().slice(0, 7);

// // ✅ نوع الـ payload المرن
// type GenerateAllPayload =
//   | { month: string }
//   | { start_date: string; end_date: string };

// const PayrollsPage = () => {
//   const [month, setMonth] = useState(currentMonth());
//   const [page, setPage] = useState(1);

//   // ✅ state للفترة المخصصة
//   const [periodMode, setPeriodMode] = useState<"month" | "range">("month");
//   const [range, setRange] = useState({ start: "", end: "" });

//   const [generateOpen, setGenerateOpen] = useState(false);
//   const [detailsId, setDetailsId] = useState<number | null>(null);
//   const [toPay, setToPay] = useState<Payroll | null>(null);
//   const [toDelete, setToDelete] = useState<Payroll | null>(null);
//   const [toApprove, setToApprove] = useState<Payroll | null>(null);

//   // ✅ للطباعة
//   const [toPrint, setToPrint] = useState<Payroll | null>(null);

//   const { data, isLoading } = useFetch<PaginatedResponse<Payroll>>({
//     queryKey: ["payrolls", page, month],
//     endpoint: "payrolls",
//     params: { page, month },
//     keepPrevious: true,
//   });
//   const payrolls = data?.data ?? (Array.isArray(data) ? (data as any) : []);
//   const meta = (data as any)?.meta;

//   const { mutate: generateAll, isLoading: generatingAll } = useMutate({
//     endpoint: "payrolls/generate-all",
//     method: "post",
//     mutationKey: ["payroll-generate-all"],
//     invalidateKeys: [["payrolls"]],
//     successMessage: "تم توليد رواتب الشهر لكل الموظفين بنجاح",
//   });

//   const { mutate: approvePayroll, isLoading: approving } = useMutate({
//     endpoint: (p: Payroll) => `payrolls/${p.id}/approve`,
//     method: "post",
//     mutationKey: ["payroll-approve"],
//     invalidateKeys: [["payrolls"]],
//     successMessage: "تم اعتماد المرتب بنجاح",
//     onSuccess: () => setToApprove(null),
//   });

//   const { mutate: deletePayroll, isLoading: deleting } = useMutate({
//     endpoint: (p: Payroll) => `payrolls/${p.id}`,
//     method: "delete",
//     mutationKey: ["payroll-delete"],
//     invalidateKeys: [["payrolls"]],
//     successMessage: "تم حذف مسير الراتب بنجاح",
//     onSuccess: () => setToDelete(null),
//   });

//   // ✅ بناء الـ payload حسب الوضع المختار
//   const buildGeneratePayload = (): GenerateAllPayload | null => {
//     if (periodMode === "range") {
//       if (!range.start || !range.end) {
//         toast.error("من فضلك اختر تاريخ البداية والنهاية");
//         return null;
//       }
//       if (range.start > range.end) {
//         toast.error("تاريخ البداية لازم يكون قبل تاريخ النهاية");
//         return null;
//       }
//       return { start_date: range.start, end_date: range.end };
//     }
//     return { month };
//   };

//   const handleGenerateAll = () => {
//     const payload = buildGeneratePayload();
//     if (!payload) return;
//     generateAll(payload);
//   };

//   return (
//     <div>
//       <PageHeader
//         title="مسيرات الرواتب"
//         subtitle="احتساب واعتماد وصرف رواتب الموظفين شهريًا حسب عقودهم"
//         action={
//           <div className="flex gap-2">
//             <button
//               className="btn-secondary"
//               disabled={generatingAll}
//               onClick={handleGenerateAll}
//             >
//               <FiZap size={16} />{" "}
//               {generatingAll
//                 ? "جاري التوليد..."
//                 : periodMode === "range"
//                   ? "توليد رواتب الفترة"
//                   : "توليد رواتب الشهر بالكامل"}
//             </button>
//             <button
//               className="btn-primary"
//               onClick={() => setGenerateOpen(true)}
//             >
//               <FiPlus size={17} /> توليد راتب موظف
//             </button>
//           </div>
//         }
//       />

//       <div className="card mb-6 flex flex-col gap-4 p-4">
//         {/* صف اختيار نوع الفترة */}
//         <div className="flex flex-wrap items-center gap-6">
//           <span className="text-sm font-bold text-ink">نوع الفترة:</span>
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="radio"
//               name="periodMode"
//               checked={periodMode === "month"}
//               onChange={() => setPeriodMode("month")}
//             />
//             شهر كامل
//           </label>
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="radio"
//               name="periodMode"
//               checked={periodMode === "range"}
//               onChange={() => setPeriodMode("range")}
//             />
//             فترة مخصصة
//           </label>
//         </div>

//         {/* صف الحقول — يتغيّر حسب الاختيار */}
//         {periodMode === "month" ? (
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//             <TextField
//               label="الشهر"
//               name="month"
//               type="month"
//               value={month}
//               onChange={(e) => {
//                 setMonth(e.target.value);
//                 setPage(1);
//               }}
//             />
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//             <TextField
//               label="من تاريخ"
//               name="start_date"
//               type="date"
//               value={range.start}
//               onChange={(e) =>
//                 setRange((r) => ({ ...r, start: e.target.value }))
//               }
//             />
//             <TextField
//               label="إلى تاريخ"
//               name="end_date"
//               type="date"
//               value={range.end}
//               onChange={(e) =>
//                 setRange((r) => ({ ...r, end: e.target.value }))
//               }
//             />
//           </div>
//         )}
//       </div>

//       <PayrollsTable
//         payrolls={payrolls}
//         isLoading={isLoading}
//         startIndex={meta?.from ?? 1}
//         onView={(p) => setDetailsId(p.id)}
//         onApprove={setToApprove}
//         onPay={setToPay}
//         onDelete={setToDelete}
//         onPrint={setToPrint}
//       />

//       <Pagination meta={meta} onPageChange={setPage} />

//       <GeneratePayrollModal
//         open={generateOpen}
//         onClose={() => setGenerateOpen(false)}
//         month={month}
//       />

//       <PayrollDetailsModal
//         open={!!detailsId}
//         onClose={() => setDetailsId(null)}
//         payrollId={detailsId}
//       />

//       <PayPayrollModal
//         open={!!toPay}
//         onClose={() => setToPay(null)}
//         payroll={toPay}
//       />

//       <PayrollPrintModal
//         open={!!toPrint}
//         onClose={() => setToPrint(null)}
//         payroll={toPrint}
//       />

//       <ConfirmDialog
//         open={!!toApprove}
//         onClose={() => setToApprove(null)}
//         onConfirm={() => toApprove && approvePayroll(toApprove)}
//         loading={approving}
//         tone="primary"
//         title="تأكيد اعتماد الراتب"
//         confirmLabel="اعتماد"
//         loadingLabel="جاري الاعتماد..."
//         message={`هل تريد اعتماد راتب "${
//           toApprove?.user?.name ?? `موظف #${toApprove?.user_id}`
//         }" عن شهر ${toApprove?.month}؟`}
//       />

//       <ConfirmDialog
//         open={!!toDelete}
//         onClose={() => setToDelete(null)}
//         onConfirm={() => toDelete && deletePayroll(toDelete)}
//         loading={deleting}
//         message={`هل أنت متأكد من حذف مسير راتب "${
//           toDelete?.user?.name ?? `موظف #${toDelete?.user_id}`
//         }"؟`}
//       />
//     </div>
//   );
// };

// export default PayrollsPage;

import { useMemo, useState } from "react";
import { FiPlus, FiZap } from "react-icons/fi";
import { toast } from "react-toastify";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { TextField } from "@/components/shared/FormField";
import type { PaginatedResponse } from "@/types";
import PayrollsTable from "@/components/payroll/Payrollstable";
import { Payroll } from "@/utils/contractPayroll";
import GeneratePayrollModal from "@/components/payroll/Generatepayrollmodal";
import PayrollDetailsModal from "@/components/payroll/Payrolldetailsmodal";
import PayPayrollModal from "@/components/payroll/Paypayrollmodal";
import PayrollPrintModal from "@/components/payroll/PayrollPrintModal";

const currentMonth = (): string => new Date().toISOString().slice(0, 7);

// ✅ آخر N شهور (الأحدث أولًا) بصيغة YYYY-MM
const getRecentMonths = (count = 4): string[] => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
};

const monthLabel = (m: string): string =>
  new Date(`${m}-01`).toLocaleDateString("ar-EG", {
    month: "long",
    year: "numeric",
  });

type GenerateAllPayload =
  | { month: string }
  | { start_date: string; end_date: string };

const PayrollsPage = () => {
  const [month, setMonth] = useState<string>(currentMonth());
  const [page, setPage] = useState(1);

  const [periodMode, setPeriodMode] = useState<"month" | "range">("month");
  const [range, setRange] = useState({ start: "", end: "" });

  const [generateOpen, setGenerateOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [toPay, setToPay] = useState<Payroll | null>(null);
  const [toDelete, setToDelete] = useState<Payroll | null>(null);
  const [toApprove, setToApprove] = useState<Payroll | null>(null);
  const [toPrint, setToPrint] = useState<Payroll | null>(null);

  const { data, isLoading } = useFetch<PaginatedResponse<Payroll>>({
    queryKey: ["payrolls", page, month],
    endpoint: "payrolls",
    // ✅ per_page كبير عشان الفلترة المحلية تشتغل على كل السجلات
    params: { page, month, per_page: 100 },
    keepPrevious: true,
  });

  const allPayrolls: Payroll[] =
    data?.data ?? (Array.isArray(data) ? (data as any) : []);
  const meta = (data as any)?.meta;

  // ✅ الفصل: الـ API بيرجّع كل الشهور، فبنفلتر هنا
  const payrolls = useMemo<Payroll[]>(() => {
    if (periodMode === "month") {
      return allPayrolls.filter((p) => p.month === month);
    }
    if (range.start && range.end) {
      return allPayrolls.filter(
        (p) => p.start_date >= range.start && p.end_date <= range.end
      );
    }
    return allPayrolls;
  }, [allPayrolls, periodMode, month, range]);

  // ✅ الـ tabs: آخر 4 شهور + الشهر المختار لو خارجهم
  const tabs = useMemo<string[]>(() => {
    const recent = getRecentMonths(4);
    return recent.includes(month) ? recent : [month, ...recent];
  }, [month]);

  const { mutate: generateAll, isLoading: generatingAll } = useMutate({
    endpoint: "payrolls/generate-all",
    method: "post",
    mutationKey: ["payroll-generate-all"],
    invalidateKeys: [["payrolls"]],
    successMessage: "تم توليد رواتب الشهر لكل الموظفين بنجاح",
  });

  const { mutate: approvePayroll, isLoading: approving } = useMutate({
    endpoint: (p: Payroll) => `payrolls/${p.id}/approve`,
    method: "post",
    mutationKey: ["payroll-approve"],
    invalidateKeys: [["payrolls"]],
    successMessage: "تم اعتماد المرتب بنجاح",
    onSuccess: () => setToApprove(null),
  });

  const { mutate: deletePayroll, isLoading: deleting } = useMutate({
    endpoint: (p: Payroll) => `payrolls/${p.id}`,
    method: "delete",
    mutationKey: ["payroll-delete"],
    invalidateKeys: [["payrolls"]],
    successMessage: "تم حذف مسير الراتب بنجاح",
    onSuccess: () => setToDelete(null),
  });

  const buildGeneratePayload = (): GenerateAllPayload | null => {
    if (periodMode === "range") {
      if (!range.start || !range.end) {
        toast.error("من فضلك اختر تاريخ البداية والنهاية");
        return null;
      }
      if (range.start > range.end) {
        toast.error("تاريخ البداية لازم يكون قبل تاريخ النهاية");
        return null;
      }
      return { start_date: range.start, end_date: range.end };
    }
    return { month };
  };

  const handleGenerateAll = () => {
    const payload = buildGeneratePayload();
    if (!payload) return;
    generateAll(payload);
  };

  const selectMonth = (m: string) => {
    setMonth(m);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="مسيرات الرواتب"
        subtitle="احتساب واعتماد وصرف رواتب الموظفين شهريًا حسب عقودهم"
        action={
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              disabled={generatingAll}
              onClick={handleGenerateAll}
            >
              <FiZap size={16} />{" "}
              {generatingAll
                ? "جاري التوليد..."
                : periodMode === "range"
                  ? "توليد رواتب الفترة"
                  : "توليد رواتب الشهر بالكامل"}
            </button>
            <button
              className="btn-primary"
              onClick={() => setGenerateOpen(true)}
            >
              <FiPlus size={17} /> توليد راتب موظف
            </button>
          </div>
        }
      />

      <div className="card mb-6 flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-sm font-bold text-ink">نوع الفترة:</span>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="periodMode"
              checked={periodMode === "month"}
              onChange={() => setPeriodMode("month")}
            />
            شهر كامل
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="periodMode"
              checked={periodMode === "range"}
              onChange={() => setPeriodMode("range")}
            />
            فترة مخصصة
          </label>
        </div>

        {periodMode === "month" ? (
          <>
            {/* ✅ Tabs الشهور */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(m)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    m === month
                      ? "bg-primary-600 text-white"
                      : "bg-ink/5 text-ink/70 hover:bg-ink/10"
                  }`}
                >
                  {monthLabel(m)}
                </button>
              ))}
            </div>

            {/* اختيار شهر أقدم */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                label="شهر آخر"
                name="month"
                type="month"
                value={month}
                onChange={(e) => selectMonth(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="من تاريخ"
              name="start_date"
              type="date"
              value={range.start}
              onChange={(e) =>
                setRange((r) => ({ ...r, start: e.target.value }))
              }
            />
            <TextField
              label="إلى تاريخ"
              name="end_date"
              type="date"
              value={range.end}
              onChange={(e) =>
                setRange((r) => ({ ...r, end: e.target.value }))
              }
            />
          </div>
        )}
      </div>

      <PayrollsTable
        payrolls={payrolls}
        isLoading={isLoading}
        startIndex={1}
        onView={(p) => setDetailsId(p.id)}
        onApprove={setToApprove}
        onPay={setToPay}
        onDelete={setToDelete}
        onPrint={setToPrint}
      />

      {meta?.last_page > 1 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      <GeneratePayrollModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        month={month}
      />

      <PayrollDetailsModal
        open={!!detailsId}
        onClose={() => setDetailsId(null)}
        payrollId={detailsId}
      />

      <PayPayrollModal
        open={!!toPay}
        onClose={() => setToPay(null)}
        payroll={toPay}
      />

      <PayrollPrintModal
        open={!!toPrint}
        onClose={() => setToPrint(null)}
        payroll={toPrint}
      />

      <ConfirmDialog
        open={!!toApprove}
        onClose={() => setToApprove(null)}
        onConfirm={() => toApprove && approvePayroll(toApprove)}
        loading={approving}
        tone="primary"
        title="تأكيد اعتماد الراتب"
        confirmLabel="اعتماد"
        loadingLabel="جاري الاعتماد..."
        message={`هل تريد اعتماد راتب "${
          toApprove?.user?.name ?? `موظف #${toApprove?.user_id}`
        }" عن شهر ${toApprove?.month}؟`}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deletePayroll(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف مسير راتب "${
          toDelete?.user?.name ?? `موظف #${toDelete?.user_id}`
        }"؟`}
      />
    </div>
  );
};

export default PayrollsPage;