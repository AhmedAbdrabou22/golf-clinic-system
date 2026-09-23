// import { useEffect, useMemo, useState } from "react";
// import Modal from "@/components/shared/Modal";
// import { SelectField, TextField, TextareaField } from "@/components/shared/FormField";
// import useFetch from "@/hooks/useFetch";
// import useMutate from "@/hooks/useMutate";
// import { VISIT_TYPES } from "@/utils/constants";
// import type { Appointment, Department, Patient, Service, Staff } from "@/types";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   appointment: Appointment | null;
// }

// const initialForm = {
//   patient_id: "",
//   department_id: "",
//   doctor_id: "",
//   service_id: "",
//   appointment_date: "",
//   visit_type: "consultation",
//   notes: "",
// };

// const AppointmentFormModal = ({ open, onClose, appointment }: Props) => {
//   const isEdit = !!appointment;
//   const [form, setForm] = useState(initialForm);

//   useEffect(() => {
//     if (open) {
//       setForm(
//         appointment
//           ? {
//             patient_id: String(appointment.patient_id),
//             department_id: String(appointment.service?.department_id ?? ""), // ← جديد
//             doctor_id: String(appointment.doctor_id),
//             service_id: String(appointment.service_id),
//             appointment_date: appointment.appointment_date?.slice(0, 10) ?? "",
//             visit_type: appointment.visit_type,
//             notes: appointment.notes ?? "",
//           }
//           : initialForm
//       );
//     }
//   }, [open, appointment]);

//   const { data: patientData } = useFetch<{ data: Patient[] }>({
//     queryKey: ["patients"],
//     endpoint: "patients",
//     enabled: open,
//   });

//   const { data: departmentData } = useFetch<{ data: Department[] }>({
//     queryKey: ["departments"],
//     endpoint: "departments",
//     enabled: open,
//   });
//   const departments = departmentData?.data ?? (Array.isArray(departmentData) ? (departmentData as any) : []);
//   const patients = patientData?.data ?? (Array.isArray(patientData) ? (patientData as any) : []);

//   const { data: staffData } = useFetch<{ data: Staff[] }>({
//     queryKey: ["staff"],
//     endpoint: "auth/staff",
//     enabled: open,
//   });
//   const staff = staffData?.data ?? (Array.isArray(staffData) ? (staffData as any) : []);
//   const doctors = staff.filter((s: Staff) => s.type === "doctor");

//   const { data: serviceData } = useFetch<{ data: Service[] }>({
//     queryKey: ["services"],
//     endpoint: "services",
//     enabled: open,
//   });
//   const services = serviceData?.data ?? (Array.isArray(serviceData) ? (serviceData as any) : []);

//   const filteredServices = useMemo(() => {
//     if (!form.department_id) return [];
//     return services.filter(
//       (s: Service) => String(s.department_id) === String(form.department_id)
//     );
//   }, [services, form.department_id]);

//   const { mutate, isLoading } = useMutate({
//     endpoint: isEdit ? `appointments/${appointment?.id}` : "appointments",
//     method: isEdit ? "put" : "post",
//     mutationKey: ["appointment-save"],
//     invalidateKeys: [["appointments"]],
//     successMessage: isEdit ? "تم تعديل الحجز بنجاح" : "تم إنشاء الحجز بنجاح",
//     onSuccess: onClose,
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     mutate({
//       patient_id: Number(form.patient_id),
//       doctor_id: Number(form.doctor_id),
//       service_id: Number(form.service_id),
//       appointment_date: form.appointment_date,
//       visit_type: form.visit_type,
//       notes: form.notes,
//     });
//   };

//   return (
//     <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الحجز" : "حجز موعد جديد"} width="md">
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <SelectField
//             label="المريض"
//             name="patient_id"
//             required
//             value={form.patient_id}
//             onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
//             options={patients.map((p: Patient) => ({ value: p.id, label: p.name }))}
//           />
//           <SelectField
//             label="الطبيب"
//             name="doctor_id"
//             required
//             value={form.doctor_id}
//             onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
//             options={doctors.map((d: Staff) => ({ value: d.id, label: d.name }))}
//           />
//           <SelectField
//             label="القسم"
//             name="department_id"
//             required
//             value={form.department_id}
//             onChange={(e) =>
//               setForm({
//                 ...form,
//                 department_id: e.target.value,
//                 service_id: "", // ← نصفّر الخدمة لما يغيّر القسم
//               })
//             }
//             options={departments.map((d: Department) => ({ value: d.id, label: d.name }))}
//           />

//           <SelectField
//   label="الخدمة"
//   name="service_id"
//   required
//   value={form.service_id}
//   onChange={(e) => setForm({ ...form, service_id: e.target.value })}
//   options={filteredServices.map((s: Service) => ({ value: s.id, label: s.name }))}
// />
//           <SelectField
//             label="نوع الزيارة"
//             name="visit_type"
//             required
//             value={form.visit_type}
//             onChange={(e) => setForm({ ...form, visit_type: e.target.value })}
//             options={VISIT_TYPES}
//           />
//           <TextField
//             label="تاريخ الموعد"
//             name="appointment_date"
//             type="date"
//             required
//             value={form.appointment_date}
//             onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
//           />
//         </div>
//         <TextareaField
//           label="ملاحظات"
//           name="notes"
//           value={form.notes}
//           onChange={(e) => setForm({ ...form, notes: e.target.value })}
//         />
//         <div className="mt-2 flex gap-3">
//           <button type="button" onClick={onClose} className="btn-secondary flex-1">
//             إلغاء
//           </button>
//           <button type="submit" disabled={isLoading} className="btn-primary flex-1">
//             {isLoading ? "جاري الحفظ..." : "حفظ"}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default AppointmentFormModal;

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/shared/Modal";
import { SelectField, TextField, TextareaField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import { VISIT_TYPES } from "@/utils/constants";
import type { Appointment, Department, Patient, Service, Staff } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const initialForm = {
  patient_id: "",
  department_id: "",
  doctor_id: "",
  service_id: "",
  service_items_ids: [] as number[],
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
            department_id: String(appointment.service?.department_id ?? ""),
            doctor_id: String(appointment.doctor_id),
            service_id: String(appointment.service_id),
            service_items_ids:
              (appointment as any).service_items_ids ??
              (appointment as any).service_items?.map((si: any) => si.id) ??
              [],
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

  const { data: departmentData } = useFetch<{ data: Department[] }>({
    queryKey: ["departments"],
    endpoint: "departments",
    enabled: open,
  });
  const departments =
    departmentData?.data ?? (Array.isArray(departmentData) ? (departmentData as any) : []);
  const patients =
    patientData?.data ?? (Array.isArray(patientData) ? (patientData as any) : []);

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
  const services =
    serviceData?.data ?? (Array.isArray(serviceData) ? (serviceData as any) : []);

  const filteredServices = useMemo(() => {
    if (!form.department_id) return [];
    return services.filter(
      (s: Service) => String(s.department_id) === String(form.department_id)
    );
  }, [services, form.department_id]);

  const selectedService = useMemo(
    () => services.find((s: Service) => String(s.id) === form.service_id),
    [services, form.service_id]
  );

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `appointments/${appointment?.id}` : "appointments",
    method: isEdit ? "put" : "post",
    mutationKey: ["appointment-save"],
    invalidateKeys: [["appointments"]],
    successMessage: isEdit ? "تم تعديل الحجز بنجاح" : "تم إنشاء الحجز بنجاح",
    onSuccess: onClose,
  });

  const toggleServiceItem = (itemId: number) => {
    setForm((f) => {
      const current = f.service_items_ids ?? [];
      const exists = current.includes(itemId);
      return {
        ...f,
        service_items_ids: exists
          ? current.filter((id) => id !== itemId)
          : [...current, itemId],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Record<string, any> = {
      patient_id: Number(form.patient_id),
      doctor_id: Number(form.doctor_id),
      service_id: Number(form.service_id),
      appointment_date: form.appointment_date,
      visit_type: form.visit_type,
      notes: form.notes,
    };

    // نضيف serviceitemsids بس لو في أصناف مختارة
    if (form.service_items_ids && form.service_items_ids.length > 0) {
      payload.serviceitemsids = form.service_items_ids;
    }

    mutate(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل الحجز" : "حجز موعد جديد"}
      width="md"
    >
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
            label="القسم"
            name="department_id"
            required
            value={form.department_id}
            onChange={(e) =>
              setForm({
                ...form,
                department_id: e.target.value,
                service_id: "",
                service_items_ids: [],
              })
            }
            options={departments.map((d: Department) => ({ value: d.id, label: d.name }))}
          />

          <SelectField
            label="الخدمة"
            name="service_id"
            required
            value={form.service_id}
            onChange={(e) =>
              setForm({
                ...form,
                service_id: e.target.value,
                service_items_ids: [],
              })
            }
            options={filteredServices.map((s: Service) => ({ value: s.id, label: s.name }))}
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

        {/* ==== الأصناف المستهلكة في الخدمة المختارة ==== */}
        {/* ==== الأصناف المستهلكة في الخدمة المختارة ==== */}
        {selectedService && selectedService.items && selectedService.items.length > 0 && (
          <div className="rounded-xl bg-mint-100/70 px-4 py-3">
            <p className="mb-3 flex items-center gap-1 text-xs font-bold text-primary-600">
              الأصناف المستهلكة في هذه الخدمة (اختر ما سيتم استخدامه):
            </p>
            <div className="flex flex-col gap-2">
              {selectedService.items
  .filter((si: any) => Number(si.current_stock) > 0)
  .map((si: any) => {
    const checked = (form.service_items_ids ?? []).includes(si.id);
    return (
      <label
        key={si.id}
        className={`flex cursor-pointer flex-col gap-2 rounded-lg border px-3 py-2.5 transition ${checked
            ? "border-primary-500 bg-white"
            : "border-transparent bg-white/60 hover:bg-white"
          }`}
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-primary-600"
            checked={checked}
            onChange={() => toggleServiceItem(si.id)}
          />
          <span className="text-sm font-bold text-ink">{si.name}</span>
        </div>

        {/* بيانات الـ item كاملة - للعرض فقط */}
        <div className="ms-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-bold text-ink/60">
          <span>
            وحدة المخزون: <span className="text-ink/80">{si.stock_unit}</span>
          </span>
          <span>
            الكمية المستخدمة:{" "}
            <span className="text-primary-600">{si.quantity}</span>
          </span>
          <span>
            المتاح بالمخزن:{" "}
            <span
              className={
                Number(si.current_stock) <= 5
                  ? "text-coral-600"
                  : "text-ink/80"
              }
            >
              {si.current_stock} {si.stock_unit}
            </span>
          </span>
        </div>
      </label>
    );
  })}
            </div>
          </div>
        )}

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