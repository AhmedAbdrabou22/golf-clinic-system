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

// const currentMonth = () => new Date().toISOString().slice(0, 7); // "2026-09"

// const PayrollsPage = () => {
//   const [month, setMonth] = useState(currentMonth());
//   const [page, setPage] = useState(1);

//   const [generateOpen, setGenerateOpen] = useState(false);
//   const [detailsId, setDetailsId] = useState<number | null>(null);
//   const [toPay, setToPay] = useState<Payroll | null>(null);
//   const [toDelete, setToDelete] = useState<Payroll | null>(null);
//   const [toApprove, setToApprove] = useState<Payroll | null>(null);

//   const { data, isLoading } = useFetch<PaginatedResponse<Payroll>>({
//     queryKey: ["payrolls"],
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
//               <FiZap size={16} /> {generatingAll ? "جاري التوليد..." : "توليد رواتب الشهر بالكامل"}
//             </button>
//             <button className="btn-primary" onClick={() => setGenerateOpen(true)}>
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
//       />

//       <Pagination meta={meta} onPageChange={setPage} />

//       <GeneratePayrollModal open={generateOpen} onClose={() => setGenerateOpen(false)} month={month} />

//       <PayrollDetailsModal open={!!detailsId} onClose={() => setDetailsId(null)} payrollId={detailsId} />

//       <PayPayrollModal open={!!toPay} onClose={() => setToPay(null)} payroll={toPay} />

//       <ConfirmDialog
//         open={!!toApprove}
//         onClose={() => setToApprove(null)}
//         onConfirm={() => toApprove && approvePayroll(toApprove)}
//         loading={approving}
//         tone="primary"
//         title="تأكيد اعتماد الراتب"
//         confirmLabel="اعتماد"
//         loadingLabel="جاري الاعتماد..."
//         message={`هل تريد اعتماد راتب "${toApprove?.user?.name ?? `موظف #${toApprove?.user_id}`}" عن شهر ${toApprove?.month}؟`}
//       />

//       <ConfirmDialog
//         open={!!toDelete}
//         onClose={() => setToDelete(null)}
//         onConfirm={() => toDelete && deletePayroll(toDelete)}
//         loading={deleting}
//         message={`هل أنت متأكد من حذف مسير راتب "${toDelete?.user?.name ?? `موظف #${toDelete?.user_id}`}"؟`}
//       />
//     </div>
//   );
// };

// export default PayrollsPage;

import { useState } from "react";
import { FiPlus, FiZap } from "react-icons/fi";
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

const PayrollsPage = () => {
  const [month, setMonth] = useState(currentMonth());
  const [page, setPage] = useState(1);

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
              onClick={() => generateAll({ month })}
            >
              <FiZap size={16} />{" "}
              {generatingAll ? "جاري التوليد..." : "توليد رواتب الشهر بالكامل"}
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

      <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <TextField
          label="الشهر"
          name="month"
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setPage(1);
          }}
          disabled
        />
      </div>

      <PayrollsTable
        payrolls={payrolls}
        isLoading={isLoading}
        startIndex={meta?.from ?? 1}
        onView={(p) => setDetailsId(p.id)}
        onApprove={setToApprove}
        onPay={setToPay}
        onDelete={setToDelete}
        onPrint={setToPrint}   // ✅ جديد
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