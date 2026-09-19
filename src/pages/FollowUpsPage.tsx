import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { SelectField } from "@/components/shared/FormField";
import { FOLLOW_UP_STATUSES } from "@/utils/constants";
import type { FollowUp, PaginatedResponse } from "@/types";
import FollowUpsTable from "@/components/follow-ups/followUpsTable";
import FollowUpFormModal from "@/components/follow-ups/FollowUpFormModal";

const FollowUpsPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<FollowUp | null>(null);
  const [toDelete, setToDelete] = useState<FollowUp | null>(null);

  const { data, isLoading } = useFetch<PaginatedResponse<FollowUp>>({
    queryKey: ["follow-ups"],
    endpoint: "follow-ups",
    params: { page, ...(status ? { status } : {}) },
    keepPrevious: true,
  });
  const followUps = data?.data ?? (Array.isArray(data) ? (data as any) : []);
  const meta = (data as any)?.meta;

  const { mutate: deleteFollowUp, isLoading: deleting } = useMutate({
    endpoint: (f: FollowUp) => `follow-ups/${f.id}`,
    method: "delete",
    mutationKey: ["follow-up-delete"],
    invalidateKeys: [["follow-ups"]],
    successMessage: "تم حذف المتابعة بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="المتابعات"
        subtitle="متابعة المرضى بعد الكشف أو الجلسات"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> متابعة جديدة
          </button>
        }
      />

      <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <SelectField
          label="فلترة حسب الحالة"
          name="status"
          placeholder="كل الحالات"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={FOLLOW_UP_STATUSES}
        />
      </div>

      <FollowUpsTable
        followUps={followUps}
        isLoading={isLoading}
        startIndex={meta?.from ?? 1}
        onEdit={(f) => {
          setSelected(f);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <Pagination meta={meta} onPageChange={setPage} />

      <FollowUpFormModal open={formOpen} onClose={() => setFormOpen(false)} followUp={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteFollowUp(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف هذه المتابعة؟`}
      />
    </div>
  );
};

export default FollowUpsPage;