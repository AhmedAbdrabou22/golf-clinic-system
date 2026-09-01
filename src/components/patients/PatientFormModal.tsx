import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField, SelectField, CheckboxField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import { GENDER_OPTIONS } from "@/utils/constants";
import type { Patient } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
}

const initialForm = { name: "", phone: "", gender: "male", age: "", is_staff: false };

const PatientFormModal = ({ open, onClose, patient }: Props) => {
  const isEdit = !!patient;
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setForm(
        patient
          ? {
              name: patient.name,
              phone: patient.phone,
              gender: patient.gender,
              age: String(patient.age),
              is_staff: !!patient.is_staff,
            }
          : initialForm
      );
    }
  }, [open, patient]);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `patients/${patient?.id}` : "patients",
    method: isEdit ? "put" : "post",
    mutationKey: ["patient-save"],
    invalidateKeys: [["patients"]],
    successMessage: isEdit ? "تم تعديل بيانات المريض بنجاح" : "تم إضافة المريض بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      age: Number(form.age),
      is_staff: form.is_staff,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل بيانات المريض" : "إضافة مريض جديد"} width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="اسم المريض"
          name="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          label="رقم الهاتف"
          name="phone"
          dir="ltr"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="01xxxxxxxxx"
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="النوع"
            name="gender"
            required
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            options={GENDER_OPTIONS}
          />
          <TextField
            label="السن"
            name="age"
            type="number"
            min={0}
            required
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </div>
        <CheckboxField
          label="المريض من طاقم العمل"
          name="is_staff"
          checked={form.is_staff}
          onChange={(e) => setForm({ ...form, is_staff: e.target.checked })}
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

export default PatientFormModal;
