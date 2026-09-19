import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { SelectField } from "@/components/shared/FormField";
import { Contract } from "@/utils/contractPayroll";
import { PaginatedResponse } from "@/types";
import ContractsTable from "@/components/contracts/Contractstable";
import ContractFormModal from "@/components/contracts/Contractformmodal";

const ACTIVE_FILTER_OPTIONS = [
  { value: "true", label: "العقود الفعالة فقط" },
  { value: "false", label: "العقود الموقوفة فقط" },
];

const ContractsPage = () => {
  const [isActive, setIsActive] = useState("true");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [toDelete, setToDelete] = useState<Contract | null>(null);

  const { data, isLoading } = useFetch<PaginatedResponse<Contract>>({
    queryKey: ["contracts"],
    endpoint: "contracts",
    params: { page, ...(isActive ? { is_active: isActive } : {}) },
    keepPrevious: true,
  });
  const contracts = data?.data ?? (Array.isArray(data) ? (data as any) : []);
  const meta = (data as any)?.meta;

  const { mutate: deleteContract, isLoading: deleting } = useMutate({
    endpoint: (c: Contract) => `contracts/${c.id}`,
    method: "delete",
    mutationKey: ["contract-delete"],
    invalidateKeys: [["contracts"]],
    successMessage: "تم حذف العقد بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="عقود وعمولات الموظفين"
        subtitle="تحديد نظام الرواتب والعمولات لكل موظف حسب طبيعة عمله"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> عقد جديد
          </button>
        }
      />

      <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <SelectField
          label="فلترة حسب الحالة"
          name="is_active"
          placeholder="كل الحالات"
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value);
            setPage(1);
          }}
          options={ACTIVE_FILTER_OPTIONS}
        />
      </div>

      <ContractsTable
        contracts={contracts}
        isLoading={isLoading}
        startIndex={meta?.from ?? 1}
        onEdit={(c) => {
          setSelected(c);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <Pagination meta={meta} onPageChange={setPage} />

      <ContractFormModal open={formOpen} onClose={() => setFormOpen(false)} contract={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteContract(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف عقد "${toDelete?.title}"؟`}
      />
    </div>
  );
};

export default ContractsPage;