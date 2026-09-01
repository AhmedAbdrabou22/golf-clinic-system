import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import InvoicesTable from "@/components/invoices/InvoicesTable";
import InvoiceFormModal from "@/components/invoices/InvoiceFormModal";
import InvoiceDetailsModal from "@/components/invoices/InvoiceDetailsModal";
import RefundModal from "@/components/invoices/RefundModal";
import type { Invoice } from "@/types";

const InvoicesPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [refundTarget, setRefundTarget] = useState<Invoice | null>(null);
  const [toDelete, setToDelete] = useState<Invoice | null>(null);

  const { data, isLoading } = useFetch<{ data: Invoice[] }>({
    queryKey: ["invoices"],
    endpoint: "invoices",
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
          <button className="btn-primary" onClick={() => setFormOpen(true)}>
            <FiPlus size={17} /> فاتورة جديدة
          </button>
        }
      />

      <InvoicesTable
        invoices={invoices}
        isLoading={isLoading}
        onView={(inv) => setViewId(inv.id)}
        onRefund={setRefundTarget}
        onDelete={setToDelete}
      />

      <InvoiceFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <InvoiceDetailsModal open={!!viewId} onClose={() => setViewId(null)} invoiceId={viewId} />
      <RefundModal open={!!refundTarget} onClose={() => setRefundTarget(null)} invoice={refundTarget} />

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
