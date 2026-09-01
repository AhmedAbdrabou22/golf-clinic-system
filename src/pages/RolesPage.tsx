import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import RolesTable from "@/components/roles/RolesTable";
import RoleFormModal from "@/components/roles/RoleFormModal";
import type { Role } from "@/types";

const RolesPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);
  const [toDelete, setToDelete] = useState<Role | null>(null);

  const { data, isLoading } = useFetch<{ data: Role[] }>({
    queryKey: ["roles"],
    endpoint: "auth/roles",
  });
  const roles = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  const { mutate: deleteRole, isLoading: deleting } = useMutate({
    endpoint: (r: Role) => `auth/roles/${r.id}`,
    method: "delete",
    mutationKey: ["role-delete"],
    invalidateKeys: [["roles"]],
    successMessage: "تم حذف الدور بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="الأدوار والصلاحيات"
        subtitle="إدارة أدوار المستخدمين وصلاحياتهم في النظام"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> دور جديد
          </button>
        }
      />

      <RolesTable
        roles={roles}
        isLoading={isLoading}
        onEdit={(r) => {
          setSelected(r);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <RoleFormModal open={formOpen} onClose={() => setFormOpen(false)} role={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteRole(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف دور "${toDelete?.name}"؟`}
      />
    </div>
  );
};

export default RolesPage;
