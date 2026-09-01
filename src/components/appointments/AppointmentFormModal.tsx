import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { SelectField, TextField, TextareaField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import { VISIT_TYPES } from "@/utils/constants";
import type { Appointment, Patient, Service, Staff } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const initialForm = {
  patient_id: "",
  doctor_id: "",
  service_id: "",
  appointment_date: "",
  visit_type: "consultation",
  notes: "",
};

const AppointmentFormModal = ({ open, onClose, appointment }: Props) => {
  const isEdit = !!appointment;
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setForm(
        appointment
          ? {
              patient_id: String(appointment.patient_id),
              doctor_id: String(appointment.doctor_id),
              service_id: String(appointment.service_id),
              appointment_date: appointment.appointment_date?.slice(0, 10) ?? "",
              visit_type: appointment.visit_type,
              notes: appointment.notes ?? "",
            }
          : initialForm
      );
    }
  }, [open, appointment]);

  const { data: patientData } = useFetch<{ data: Patient[] }>({
    queryKey: ["patients"],
    endpoint: "patients",
    enabled: open,
  });
  const patients = patientData?.data ?? (Array.isArray(patientData) ? (patientData as any) : []);

  const { data: staffData } = useFetch<{ data: Staff[] }>({
    queryKey: ["staff"],
    endpoint: "auth/staff",
    enabled: open,
  });
  const staff = staffData?.data ?? (Array.isArray(staffData) ? (staffData as any) : []);
  const doctors = staff.filter((s: Staff) => s.type === "doctor");

  const { data: serviceData } = useFetch<{ data: Service[] }>({
    queryKey: ["services"],
    endpoint: "services",
    enabled: open,
  });
  const services = serviceData?.data ?? (Array.isArray(serviceData) ? (serviceData as any) : []);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `appointments/${appointment?.id}` : "appointments",
    method: isEdit ? "put" : "post",
    mutationKey: ["appointment-save"],
    invalidateKeys: [["appointments"]],
    successMessage: isEdit ? "تم تعديل الحجز بنجاح" : "تم إنشاء الحجز بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      patient_id: Number(form.patient_id),
      doctor_id: Number(form.doctor_id),
      service_id: Number(form.service_id),
      appointment_date: form.appointment_date,
      visit_type: form.visit_type,
      notes: form.notes,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الحجز" : "حجز موعد جديد"} width="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="المريض"
            name="patient_id"
            required
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            options={patients.map((p: Patient) => ({ value: p.id, label: p.name }))}
          />
          <SelectField
            label="الطبيب"
            name="doctor_id"
            required
            value={form.doctor_id}
            onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
            options={doctors.map((d: Staff) => ({ value: d.id, label: d.name }))}
          />
          <SelectField
            label="الخدمة"
            name="service_id"
            required
            value={form.service_id}
            onChange={(e) => setForm({ ...form, service_id: e.target.value })}
            options={services.map((s: Service) => ({ value: s.id, label: s.name }))}
          />
          <SelectField
            label="نوع الزيارة"
            name="visit_type"
            required
            value={form.visit_type}
            onChange={(e) => setForm({ ...form, visit_type: e.target.value })}
            options={VISIT_TYPES}
          />
          <TextField
            label="تاريخ الموعد"
            name="appointment_date"
            type="date"
            required
            value={form.appointment_date}
            onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
          />
        </div>
        <TextareaField
          label="ملاحظات"
          name="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentFormModal;
