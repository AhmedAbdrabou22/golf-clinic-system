import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SuppliersTable from "@/components/suppliers/SuppliersTable";
import SupplierFormModal from "@/components/suppliers/SupplierFormModal";
import type { Supplier } from "@/types";

const SuppliersPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [toDelete, setToDelete] = useState<Supplier | null>(null);

  const { data, isLoading } = useFetch<{ data: Supplier[] }>({
    queryKey: ["suppliers"],
    endpoint: "suppliers",
  });
  const suppliers = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  const { mutate: deleteSupplier, isLoading: deleting } = useMutate({
    endpoint: (s: Supplier) => `suppliers/${s.id}`,
    method: "delete",
    mutationKey: ["supplier-delete"],
    invalidateKeys: [["suppliers"]],
    successMessage: "تم حذف المورد بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="الموردين"
        subtitle="إدارة موردي الأدوية والمستلزمات الطبية"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> مورد جديد
          </button>
        }
      />

      <SuppliersTable
        suppliers={suppliers}
        isLoading={isLoading}
        onEdit={(s) => {
          setSelected(s);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <SupplierFormModal open={formOpen} onClose={() => setFormOpen(false)} supplier={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteSupplier(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف "${toDelete?.name}"؟`}
      />
    </div>
  );
};

export default SuppliersPage;
