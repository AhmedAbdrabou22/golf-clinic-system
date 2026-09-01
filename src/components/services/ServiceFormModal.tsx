import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField, SelectField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import type { Department, Service } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  service: Service | null;
}

const ServiceFormModal = ({ open, onClose, service }: Props) => {
  const isEdit = !!service;
  const [form, setForm] = useState({ name: "", price: "", department_id: "" });

  useEffect(() => {
    if (open) {
      setForm({
        name: service?.name ?? "",
        price: service?.price != null ? String(service.price) : "",
        department_id: service?.department_id != null ? String(service.department_id) : "",
      });
    }
  }, [open, service]);

  const { data: deptData } = useFetch<{ data: Department[] }>({
    queryKey: ["departments"],
    endpoint: "departments",
    enabled: open,
  });
  const departments = deptData?.data ?? (Array.isArray(deptData) ? (deptData as any) : []);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `services/${service?.id}` : "services",
    method: isEdit ? "put" : "post",
    mutationKey: ["service-save"],
    invalidateKeys: [["services"]],
    successMessage: isEdit ? "تم تعديل الخدمة بنجاح" : "تم إضافة الخدمة بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      name: form.name,
      price: Number(form.price),
      department_id: Number(form.department_id),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الخدمة" : "إضافة خدمة جديدة"} width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="اسم الخدمة"
          name="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="مثال: كشف عادي"
        />
        <SelectField
          label="القسم"
          name="department_id"
          required
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
          options={departments.map((d: Department) => ({ value: d.id, label: d.name }))}
        />
        <TextField
          label="السعر (ج.م)"
          name="price"
          type="number"
          min={0}
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
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

export default ServiceFormModal;
