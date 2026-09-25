

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FiPlus } from "react-icons/fi";
// import useFetch from "@/hooks/useFetch";
// import useMutate from "@/hooks/useMutate";
// import PageHeader from "@/components/shared/PageHeader";
// import ConfirmDialog from "@/components/shared/ConfirmDialog";
// import InvoicesTable from "@/components/invoices/InvoicesTable";
// import InvoiceDetailsModal from "@/components/invoices/InvoiceDetailsModal";
// import RefundModal from "@/components/invoices/RefundModal";
// import PayModal from "@/components/invoices/PayModal";
// import InvoicePrintModal from "@/components/invoices/Invoiceprintmodal";
// import type { Invoice } from "@/types";

// const InvoicesPage = () => {
//   const navigate = useNavigate();
//   const [viewId, setViewId] = useState<number | null>(null);
//   const [refundTarget, setRefundTarget] = useState<Invoice | null>(null);
//   const [payTarget, setPayTarget] = useState<Invoice | null>(null);
//   const [toDelete, setToDelete] = useState<Invoice | null>(null);

//   // ✅ للطباعة — بنخزن الـ id بس
//   const [printId, setPrintId] = useState<number | null>(null);

//   const { data, isLoading } = useFetch<{ data: Invoice[] }>({
//     queryKey: ["invoices"],
//     endpoint: "invoices",
//   });
//   const invoices = data?.data ?? (Array.isArray(data) ? (data as any) : []);

//   const { mutate: deleteInvoice, isLoading: deleting } = useMutate({
//     endpoint: (inv: Invoice) => `invoices/${inv.id}`,
//     method: "delete",
//     mutationKey: ["invoice-delete"],
//     invalidateKeys: [["invoices"]],
//     successMessage: "تم حذف الفاتورة بنجاح",
//     onSuccess: () => setToDelete(null),
//   });

//   return (
//     <div>
//       <PageHeader
//         title="الفواتير"
//         subtitle="إدارة فواتير الكشف والجلسات والبيع المباشر"
//         action={
//           <button className="btn-primary" onClick={() => navigate("/invoices/new")}>
//             <FiPlus size={17} /> فاتورة جديدة
//           </button>
//         }
//       />

//       <InvoicesTable
//         invoices={invoices}
//         isLoading={isLoading}
//         onView={(inv) => setViewId(inv.id)}
//         onRefund={setRefundTarget}
//         onPay={setPayTarget}
//         onDelete={setToDelete}
//         onPrint={(inv) => setPrintId(inv.id)}   // ✅
//       />

//       <InvoiceDetailsModal
//         open={!!viewId}
//         onClose={() => setViewId(null)}
//         invoiceId={viewId}
//       />
//       <RefundModal
//         open={!!refundTarget}
//         onClose={() => setRefundTarget(null)}
//         invoice={refundTarget}
//       />
//       <PayModal
//         open={!!payTarget}
//         onClose={() => setPayTarget(null)}
//         invoice={payTarget}
//       />

//       {/* ✅ مودال الطباعة — بنبعت الـ id بس */}
//       <InvoicePrintModal
//         open={!!printId}
//         onClose={() => setPrintId(null)}
//         invoiceId={printId}
//       />

//       <ConfirmDialog
//         open={!!toDelete}
//         onClose={() => setToDelete(null)}
//         onConfirm={() => toDelete && deleteInvoice(toDelete)}
//         loading={deleting}
//         message={`هل أنت متأكد من حذف فاتورة رقم #${toDelete?.id}؟`}
//       />
//     </div>
//   );
// };

// export default InvoicesPage;

import { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import InvoicesTable from "@/components/invoices/InvoicesTable";
import InvoiceDetailsModal from "@/components/invoices/InvoiceDetailsModal";
import RefundModal from "@/components/invoices/RefundModal";
import PayModal from "@/components/invoices/PayModal";
import InvoicePrintModal from "@/components/invoices/Invoiceprintmodal";
import type { Invoice } from "@/types";

const InvoicesPage = () => {
  const [viewId, setViewId] = useState<number | null>(null);
  const [refundTarget, setRefundTarget] = useState<Invoice | null>(null);
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const [toDelete, setToDelete] = useState<Invoice | null>(null);
  const [printId, setPrintId] = useState<number | null>(null);

  // ✅ البحث
  const [search, setSearch] = useState("");

  const { data, isLoading } = useFetch<{ data: Invoice[] }>({
    queryKey: ["invoices", search],
    endpoint: "invoices",
    params: {
      ...(search ? { search } : {}),
    },
    keepPrevious: true,
  });
  const invoices = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  const { mutate: deleteInvoice, isLoading: deleting } = useMutate({
    endpoint: (inv: Invoice) => `invoices/${inv.id}`,
    method: "delete",
    mutationKey: ["invoice-delete"],
    invalidateKeys: [["invoices"]],
    successMessage: "تم حذف الفاتورة بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="الفواتير"
        subtitle="إدارة فواتير الكشف والجلسات والبيع المباشر"
        action={
          <div className="relative w-full sm:w-72">
            <FiSearch
              size={16}
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink/40"
              style={{ insetInlineStart: 12 }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم الفاتورة، اسم المريض، الهاتف..."
              className="field-input w-full"
              style={{
                paddingInlineStart: 36,
                paddingInlineEnd: search ? 36 : 12,
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute top-1/2 -translate-y-1/2 rounded-md p-1 text-ink/40 hover:bg-ink/5 hover:text-ink/70"
                style={{ insetInlineEnd: 8 }}
                aria-label="مسح البحث"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        }
      />

      <InvoicesTable
        invoices={invoices}
        isLoading={isLoading}
        onView={(inv) => setViewId(inv.id)}
        onRefund={setRefundTarget}
        onPay={setPayTarget}
        onDelete={setToDelete}
        onPrint={(inv) => setPrintId(inv.id)}
      />

      <InvoiceDetailsModal
        open={!!viewId}
        onClose={() => setViewId(null)}
        invoiceId={viewId}
      />
      <RefundModal
        open={!!refundTarget}
        onClose={() => setRefundTarget(null)}
        invoice={refundTarget}
      />
      <PayModal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        invoice={payTarget}
      />

      <InvoicePrintModal
        open={!!printId}
        onClose={() => setPrintId(null)}
        invoiceId={printId}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteInvoice(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف فاتورة رقم #${toDelete?.id}؟`}
      />
    </div>
  );
};

export default InvoicesPage;