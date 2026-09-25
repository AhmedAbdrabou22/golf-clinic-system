

// import { useState } from "react";
// import { FiPlus, FiZap } from "react-icons/fi";
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

// const PayrollsPage = () => {
//   const [month, setMonth] = useState(currentMonth());
//   const [page, setPage] = useState(1);

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
//               onClick={() => generateAll({ month })}
//             >
//               <FiZap size={16} />{" "}
//               {generatingAll ? "جاري التوليد..." : "توليد رواتب الشهر بالكامل"}
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

//       <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
//         <TextField
//           label="الشهر"
//           name="month"
//           type="month"
//           value={month}
//           onChange={(e) => {
//             setMonth(e.target.value);
//             setPage(1);
//           }}
//           disabled
//         />
//       </div>

//       <PayrollsTable
//         payrolls={payrolls}
//         isLoading={isLoading}
//         startIndex={meta?.from ?? 1}
//         onView={(p) => setDetailsId(p.id)}
//         onApprove={setToApprove}
//         onPay={setToPay}
//         onDelete={setToDelete}
//         onPrint={setToPrint}   // ✅ جديد
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

import { useState } from "react";
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

const currentMonth = () => new Date().toISOString().slice(0, 7);

// ✅ نوع الـ payload المرن
type GenerateAllPayload =
  | { month: string }
  | { start_date: string; end_date: string };

const PayrollsPage = () => {
  const [month, setMonth] = useState(currentMonth());
  const [page, setPage] = useState(1);

  // ✅ state للفترة المخصصة
  const [periodMode, setPeriodMode] = useState<"month" | "range">("month");
  const [range, setRange] = useState({ start: "", end: "" });

  const [generateOpen, setGenerateOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [toPay, setToPay] = useState<Payroll | null>(null);
  const [toDelete, setToDelete] = useState<Payroll | null>(null);
  const [toApprove, setToApprove] = useState<Payroll | null>(null);

  // ✅ للطباعة
  const [toPrint, setToPrint] = useState<Payroll | null>(null);

  const { data, isLoading } = useFetch<PaginatedResponse<Payroll>>({
    queryKey: ["payrolls", page, month],
    endpoint: "payrolls",
    params: { page, month },
    keepPrevious: true,
  });
  const payrolls = data?.data ?? (Array.isArray(data) ? (data as any) : []);
  const meta = (data as any)?.meta;

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

  // ✅ بناء الـ payload حسب الوضع المختار
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
        {/* صف اختيار نوع الفترة */}
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

        {/* صف الحقول — يتغيّر حسب الاختيار */}
        {periodMode === "month" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              label="الشهر"
              name="month"
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setPage(1);
              }}
            />
          </div>
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
        startIndex={meta?.from ?? 1}
        onView={(p) => setDetailsId(p.id)}
        onApprove={setToApprove}
        onPay={setToPay}
        onDelete={setToDelete}
        onPrint={setToPrint}
      />

      <Pagination meta={meta} onPageChange={setPage} />

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