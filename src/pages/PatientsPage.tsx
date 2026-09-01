import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SearchBox from "@/components/shared/SearchBox";
import PatientsTable from "@/components/patients/PatientsTable";
import PatientFormModal from "@/components/patients/PatientFormModal";
import type { Patient } from "@/types";

const PatientsPage = () => {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  const { data, isLoading } = useFetch<{ data: Patient[] }>({
    queryKey: ["patients"],
    endpoint: "patients",
    params: search ? { search } : undefined,
    keepPrevious: true,
  });
  const patients = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  const { mutate: deletePatient, isLoading: deleting } = useMutate({
    endpoint: (p: Patient) => `patients/${p.id}`,
    method: "delete",
    mutationKey: ["patient-delete"],
    invalidateKeys: [["patients"]],
    successMessage: "تم حذف المريض بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="المرضى"
        subtitle="إدارة بيانات المرضى المسجلين بالعيادة"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> مريض جديد
          </button>
        }
      />

      <div className="mb-4">
        <SearchBox value={search} onChange={setSearch} placeholder="ابحث بالاسم أو رقم الهاتف..." />
      </div>

      <PatientsTable
        patients={patients}
        isLoading={isLoading}
        onEdit={(p) => {
          setSelected(p);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <PatientFormModal open={formOpen} onClose={() => setFormOpen(false)} patient={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deletePatient(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف "${toDelete?.name}"؟`}
      />
    </div>
  );
};

export default PatientsPage;
