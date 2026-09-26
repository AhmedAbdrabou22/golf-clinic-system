import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import StaffTable from "@/components/staff/StaffTable";
import type { Staff, PaginatedResponse } from "@/types";

const StaffContractsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Staff | null>(null);

  const { data, isLoading } = useFetch<PaginatedResponse<Staff>>({
    queryKey: ["staff", page],
    endpoint: "auth/staff",
    params: { page },
    keepPrevious: true,
  });

  const staff = data?.data ?? (Array.isArray(data) ? (data as any) : []);
  const meta = (data as any)?.meta;

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
        title="الموظفين بالعقود والعمولات"
        subtitle="إدارة طاقم العمل وعقود العمولات الخاصة بهم"
        action={
          <button className="btn-primary" onClick={() => navigate("/staff/new")}>
            <FiPlus size={17} /> اضف موظف (العقد)
          </button>
        }
      />

      <StaffTable
        staff={staff}
        isLoading={isLoading}
        onEdit={(s) => navigate(`/staff/${s.id}/edit`)}
        onDelete={setToDelete}
      />

      <Pagination meta={meta} onPageChange={setPage} />

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

export default StaffContractsPage;