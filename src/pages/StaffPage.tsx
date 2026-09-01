import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StaffTable from "@/components/staff/StaffTable";
import StaffFormModal from "@/components/staff/StaffFormModal";
import type { Staff } from "@/types";

const StaffPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [toDelete, setToDelete] = useState<Staff | null>(null);

  const { data, isLoading } = useFetch<{ data: Staff[] }>({
    queryKey: ["staff"],
    endpoint: "auth/staff",
  });
  const staff = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  const { mutate: deleteStaff, isLoading: deleting } = useMutate({
    endpoint: (s: Staff) => `auth/staff/${s.id}`,
    method: "delete",
    mutationKey: ["staff-delete"],
    invalidateKeys: [["staff"]],
    successMessage: "تم حذف الموظف بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="الموظفين"
        subtitle="إدارة طاقم العمل بالعيادة"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> موظف جديد
          </button>
        }
      />

      <StaffTable
        staff={staff}
        isLoading={isLoading}
        onEdit={(s) => {
          setSelected(s);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <StaffFormModal open={formOpen} onClose={() => setFormOpen(false)} staff={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteStaff(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف "${toDelete?.name}"؟`}
      />
    </div>
  );
};

export default StaffPage;
