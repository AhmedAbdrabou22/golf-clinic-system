import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/shared/Modal";
import { SelectField, TextField, TextareaField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import { FOLLOW_UP_STATUSES } from "@/utils/constants";
import type { Appointment, FollowUp, Patient, Staff } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  followUp: FollowUp | null;
}

const initialForm = {
  patient_id: "",
  doctor_id: "",
  appointment_id: "",
  follow_up_date: "",
  status: "pending" as FollowUp["status"],
  notes: "",
};

// "2026-09-20 14:00:00" <-> "2026-09-20T14:00" (datetime-local input)
const toInputDateTime = (value?: string) => (value ? value.replace(" ", "T").slice(0, 16) : "");
const toApiDateTime = (value: string) => (value ? `${value.replace("T", " ")}:00` : "");

const FollowUpFormModal = ({ open, onClose, followUp }: Props) => {
  const isEdit = !!followUp;
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setForm(
        followUp
          ? {
              patient_id: String(followUp.patient_id),
              doctor_id: String(followUp.doctor_id),
              appointment_id: String(followUp.appointment_id),
              follow_up_date: toInputDateTime(followUp.follow_up_date),
              status: followUp.status,
              notes: followUp.notes ?? "",
            }
          : initialForm
      );
    }
  }, [open, followUp]);

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

  const { data: appointmentData } = useFetch<{ data: Appointment[] }>({
    queryKey: ["appointments"],
    endpoint: "appointments",
    enabled: open,
  });
  const appointments =
    appointmentData?.data ?? (Array.isArray(appointmentData) ? (appointmentData as any) : []);

  // نعرض بس حجوزات المريض المختار (زي فلترة الخدمة على القسم في AppointmentFormModal)
  const filteredAppointments = useMemo(() => {
    if (!form.patient_id) return [];
    return appointments.filter(
      (a: Appointment) => String(a.patient_id) === String(form.patient_id)
    );
  }, [appointments, form.patient_id]);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `follow-ups/${followUp?.id}` : "follow-ups",
    method: isEdit ? "put" : "post",
    mutationKey: ["follow-up-save"],
    invalidateKeys: [["follow-ups"]],
    successMessage: isEdit ? "تم تعديل المتابعة بنجاح" : "تم إضافة المتابعة بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      patient_id: Number(form.patient_id),
      doctor_id: Number(form.doctor_id),
      appointment_id: Number(form.appointment_id),
      follow_up_date: toApiDateTime(form.follow_up_date),
      status: form.status,
      notes: form.notes,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل متابعة" : "إضافة متابعة جديدة"} width="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="المريض"
            name="patient_id"
            required
            value={form.patient_id}
            onChange={(e) =>
              setForm({ ...form, patient_id: e.target.value, appointment_id: "" })
            }
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
            label="الحجز المرتبط"
            name="appointment_id"
            required
            value={form.appointment_id}
            onChange={(e) => setForm({ ...form, appointment_id: e.target.value })}
            options={filteredAppointments.map((a: Appointment) => ({
              value: a.id,
              label: `حجز #${a.id} — ${a.appointment_date?.split("T")[0] ?? ""}`,
            }))}
            hint={!form.patient_id ? "اختر المريض الأول لعرض حجوزاته" : undefined}
          />
          <TextField
            label="موعد المتابعة"
            name="follow_up_date"
            type="datetime-local"
            required
            value={form.follow_up_date}
            onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
          />
          <SelectField
            label="الحالة"
            name="status"
            required
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as FollowUp["status"] })}
            options={FOLLOW_UP_STATUSES}
          />
        </div>

        <TextareaField
          label="ملاحظات"
          name="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="ملاحظات المتابعة"
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

export default FollowUpFormModal;