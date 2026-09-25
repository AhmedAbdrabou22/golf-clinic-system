// import { FiEye, FiCheck, FiDollarSign, FiTrash2 } from "react-icons/fi";
// import DataTable, { Column } from "@/components/shared/DataTable";
// import StatusBadge from "@/components/shared/StatusBadge";
// import { PAYROLL_STATUSES, labelOf, toneOf } from "@/utils/constants";
// import { Payroll } from "@/utils/contractPayroll";

// interface Props {
//   payrolls: Payroll[];
//   isLoading: boolean;
//   onView: (p: Payroll) => void;
//   onApprove: (p: Payroll) => void;
//   onPay: (p: Payroll) => void;
//   onDelete: (p: Payroll) => void;
//   startIndex?: number;
// }

// const money = (n?: number | null) => `${Number(n ?? 0).toFixed(2)} ج.م`;

// const PayrollsTable = ({ payrolls, isLoading, onView, onApprove, onPay, onDelete, startIndex = 1 }: Props) => {
//   const columns: Column<Payroll>[] = [
//     { header: "#", accessor: (_r, index) => startIndex + index },
//     {
//       header: "الموظف",
//       accessor: (r) => (
//         <span className="font-bold text-ink">{r.user?.name ?? `موظف #${r.user_id}`}</span>
//       ),
//     },
//     { header: "الشهر", accessor: (r) => r.month },
//     {
//       header: "صافي الراتب",
//       accessor: (r) => <span className="font-bold text-primary-600">{money(r.net_salary)}</span>,
//     },
//     {
//       header: "الحالة",
//       accessor: (r) => (
//         <StatusBadge label={labelOf(PAYROLL_STATUSES, r.status)} tone={toneOf(PAYROLL_STATUSES, r.status)} />
//       ),
//     },
//     {
//       header: "إجراءات",
//       accessor: (r) => (
//         <div className="flex items-center gap-2">
//           <button onClick={() => onView(r)} className="rounded-lg p-2 text-ink/60 hover:bg-ink/5" title="عرض التفاصيل">
//             <FiEye size={16} />
//           </button>
//           {r.status === "draft" && (
//             <button
//               onClick={() => onApprove(r)}
//               className="rounded-lg p-2 text-amber-600 hover:bg-amber-500/10"
//               title="اعتماد المرتب"
//             >
//               <FiCheck size={16} />
//             </button>
//           )}
//           {r.status === "approved" && (
//             <button
//               onClick={() => onPay(r)}
//               className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
//               title="تأكيد صرف الراتب"
//             >
//               <FiDollarSign size={16} />
//             </button>
//           )}
//           {r.status !== "paid" && (
//             <button
//               onClick={() => onDelete(r)}
//               className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10"
//               title="حذف"
//             >
//               <FiTrash2 size={16} />
//             </button>
//           )}
//         </div>
//       ),
//     },
//   ];

//   return (
//     <DataTable
//       columns={columns}
//       rows={payrolls}
//       isLoading={isLoading}
//       rowKey={(r) => r.id}
//       emptyTitle="لا يوجد مسيرات رواتب لهذا الشهر"
//       emptyHint="استخدم زر توليد الرواتب لاحتساب رواتب الموظفين تلقائيًا حسب عقودهم."
//     />
//   );
// };

// export default PayrollsTable;

import { FiEye, FiCheck, FiDollarSign, FiTrash2, FiPrinter } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { PAYROLL_STATUSES, labelOf, toneOf } from "@/utils/constants";
import { Payroll } from "@/utils/contractPayroll";

interface Props {
  payrolls: Payroll[];
  isLoading: boolean;
  onView: (p: Payroll) => void;
  onApprove: (p: Payroll) => void;
  onPay: (p: Payroll) => void;
  onDelete: (p: Payroll) => void;
  onPrint: (p: Payroll) => void;   // ✅ جديد
  startIndex?: number;
}

const money = (n?: number | null) => `${Number(n ?? 0).toFixed(2)} ج.م`;

const PayrollsTable = ({
  payrolls,
  isLoading,
  onView,
  onApprove,
  onPay,
  onDelete,
  onPrint,
  startIndex = 1,
}: Props) => {
  const columns: Column<Payroll>[] = [
    { header: "#", accessor: (_r, index) => startIndex + (index ?? 0) },
    {
      header: "الموظف",
      accessor: (r) => (
        <span className="font-bold text-ink">
          {r.user?.name ?? `موظف #${r.user_id}`}
        </span>
      ),
    },
    { header: "الشهر", accessor: (r) => r.month },
    {
      header: "صافي الراتب",
      accessor: (r) => (
        <span className="font-bold text-primary-600">{money(r.net_salary)}</span>
      ),
    },
    {
      header: "الحالة",
      accessor: (r) => (
        <StatusBadge
          label={labelOf(PAYROLL_STATUSES, r.status)}
          tone={toneOf(PAYROLL_STATUSES, r.status)}
        />
      ),
    },
    {
      header: "إجراءات",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(r)}
            className="rounded-lg p-2 text-ink/60 hover:bg-ink/5"
            title="عرض التفاصيل"
          >
            <FiEye size={16} />
          </button>

          {/* ✅ زرار الطباعة — يظهر بس لما الراتب اتصرف */}
          {r.status === "paid" && (
            <button
              onClick={() => onPrint(r)}
              className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
              title="طباعة مسير الراتب"
            >
              <FiPrinter size={16} />
            </button>
          )}

          {r.status === "draft" && (
            <button
              onClick={() => onApprove(r)}
              className="rounded-lg p-2 text-amber-600 hover:bg-amber-500/10"
              title="اعتماد المرتب"
            >
              <FiCheck size={16} />
            </button>
          )}

          {r.status === "approved" && (
            <button
              onClick={() => onPay(r)}
              className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
              title="تأكيد صرف الراتب"
            >
              <FiDollarSign size={16} />
            </button>
          )}

          {r.status !== "paid" && (
            <button
              onClick={() => onDelete(r)}
              className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10"
              title="حذف"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={payrolls}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا يوجد مسيرات رواتب لهذا الشهر"
      emptyHint="استخدم زر توليد الرواتب لاحتساب رواتب الموظفين تلقائيًا حسب عقودهم."
    />
  );
};

export default PayrollsTable;