import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PurchaseInvoicesTable from "@/components/purchaseInvoices/PurchaseInvoicesTable";
import PurchaseInvoiceFormModal from "@/components/purchaseInvoices/PurchaseInvoiceFormModal";
import PurchaseInvoiceDetailsModal from "@/components/purchaseInvoices/PurchaseInvoiceDetailsModal";
import type { PurchaseInvoice } from "@/types";

const PurchaseInvoicesPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<PurchaseInvoice | null>(null);

  const { data, isLoading } = useFetch<{ data: PurchaseInvoice[] }>({
    queryKey: ["purchase-invoices"],
    endpoint: "purchase-invoices",
  });
  const invoices = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  const { mutate: deleteInvoice, isLoading: deleting } = useMutate({
    endpoint: (inv: PurchaseInvoice) => `purchase-invoices/${inv.id}`,
    method: "delete",
    mutationKey: ["purchase-invoice-delete"],
    invalidateKeys: [["purchase-invoices"], ["items"]],
    successMessage: "تم حذف فاتورة الشراء بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="فواتير الشراء"
        subtitle="تسجيل ومتابعة فواتير الشراء من الموردين"
        action={
          <button className="btn-primary" onClick={() => setFormOpen(true)}>
            <FiPlus size={17} /> فاتورة شراء جديدة
          </button>
        }
      />

      <PurchaseInvoicesTable
        invoices={invoices}
        isLoading={isLoading}
        onView={(inv) => setViewId(inv.id)}
        onDelete={setToDelete}
      />

      <PurchaseInvoiceFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <PurchaseInvoiceDetailsModal
        open={!!viewId}
        onClose={() => setViewId(null)}
        invoiceId={viewId}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteInvoice(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف فاتورة الشراء رقم #${toDelete?.id}؟`}
      />
    </div>
  );
};

export default PurchaseInvoicesPage;
