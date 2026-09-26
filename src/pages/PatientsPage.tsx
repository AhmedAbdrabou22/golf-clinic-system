
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SearchBox from "@/components/shared/SearchBox";
import Pagination from "@/components/shared/Pagination";
import PatientsTable from "@/components/patients/PatientsTable";
import PatientFormModal from "@/components/patients/PatientFormModal";
import type { Patient, PaginatedResponse } from "@/types";
import PatientProfileModal from "@/components/patients/PatientProfileModal";

const PatientsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  // ✅ state للبروفايل
  const [profileId, setProfileId] = useState<number | null>(null);

  const { data, isLoading } = useFetch<PaginatedResponse<Patient>>({
    queryKey: ["patients", page, search],
    endpoint: "patients",
    params: { page, ...(search ? { search } : {}) },
    keepPrevious: true,
  });
  const patients = data?.data ?? (Array.isArray(data) ? (data as any) : []);
  const meta = data?.meta;

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
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="ابحث بالاسم أو رقم الهاتف..."
        />
      </div>

      <PatientsTable
        patients={patients}
        isLoading={isLoading}
        onEdit={(p) => {
          setSelected(p);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
        onViewProfile={(p) => setProfileId(p.id)} // ✅ جديد
      />

      <Pagination meta={meta} onPageChange={setPage} />

      <PatientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={selected}
      />

      <PatientProfileModal
        open={!!profileId}
        onClose={() => setProfileId(null)}
        patientId={profileId}
      />

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