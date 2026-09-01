import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import AppointmentsTable from "@/components/appointments/AppointmentsTable";
import AppointmentFormModal from "@/components/appointments/AppointmentFormModal";
import type { Appointment, PaginatedResponse } from "@/types";

const AppointmentsPage = () => {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [toDelete, setToDelete] = useState<Appointment | null>(null);

  const { data, isLoading } = useFetch<PaginatedResponse<Appointment>>({
    queryKey: ["appointments"],
    endpoint: "appointments",
    params: { page },
    keepPrevious: true,
  });
  const appointments = data?.data ?? (Array.isArray(data) ? (data as any) : []);
  const meta = data?.meta;

  const { mutate: deleteAppointment, isLoading: deleting } = useMutate({
    endpoint: (a: Appointment) => `appointments/${a.id}`,
    method: "delete",
    mutationKey: ["appointment-delete"],
    invalidateKeys: [["appointments"]],
    successMessage: "تم حذف الحجز بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="الحجوزات"
        subtitle="إدارة مواعيد وحجوزات المرضى"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> حجز جديد
          </button>
        }
      />

      <AppointmentsTable
        appointments={appointments}
        isLoading={isLoading}
        onEdit={(a) => {
          setSelected(a);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <Pagination meta={meta} onPageChange={setPage} />

      <AppointmentFormModal open={formOpen} onClose={() => setFormOpen(false)} appointment={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteAppointment(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف حجز رقم #${toDelete?.id}؟`}
      />
    </div>
  );
};

export default AppointmentsPage;