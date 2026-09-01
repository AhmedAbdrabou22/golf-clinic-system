import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DepartmentsTable from "@/components/departments/DepartmentsTable";
import DepartmentFormModal from "@/components/departments/DepartmentFormModal";
import type { Department } from "@/types";

const DepartmentsPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [toDelete, setToDelete] = useState<Department | null>(null);

  const { data, isLoading } = useFetch<{ data: Department[] }>({
    queryKey: ["departments"],
    endpoint: "departments",
  });

  const { mutate: deleteDept, isLoading: deleting } = useMutate({
    endpoint: (dept: Department) => `departments/${dept.id}`,
    method: "delete",
    mutationKey: ["department-delete"],
    invalidateKeys: [["departments"]],
    successMessage: "تم حذف القسم بنجاح",
    onSuccess: () => setToDelete(null),
  });

  const departments = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  return (
    <div>
      <PageHeader
        title="الأقسام"
        subtitle="إدارة أقسام العيادة المختلفة"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> قسم جديد
          </button>
        }
      />

      <DepartmentsTable
        departments={departments}
        isLoading={isLoading}
        onEdit={(dept) => {
          setSelected(dept);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <DepartmentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        department={selected}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteDept(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف "${toDelete?.name}"؟`}
      />
    </div>
  );
};

export default DepartmentsPage;
