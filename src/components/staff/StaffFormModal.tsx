import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField, SelectField, CheckboxField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import { STAFF_TYPES } from "@/utils/constants";
import type { Department, Role, Staff } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  staff: Staff | null;
}

const initialForm = {
  name: "",
  phone: "",
  email: "",
  password: "",
  role_id: "",
  type: "receptionist",
  basic_salary: "",
  is_active: true,
  department_id: "",
};

const StaffFormModal = ({ open, onClose, staff }: Props) => {
  const isEdit = !!staff;
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setForm(
        staff
          ? {
              name: staff.name,
              phone: staff.phone,
              email: staff.email ?? "",
              password: "",
              role_id: String(staff.role_id ?? ""),
              type: staff.type,
              basic_salary: staff.basic_salary != null ? String(staff.basic_salary) : "",
              is_active: staff.is_active,
              department_id: staff.department_id != null ? String(staff.department_id) : "",
            }
          : initialForm
      );
    }
  }, [open, staff]);

  const { data: roleData } = useFetch<{ data: Role[] }>({
    queryKey: ["roles"],
    endpoint: "auth/roles",
    enabled: open,
  });
  const roles = roleData?.data ?? (Array.isArray(roleData) ? (roleData as any) : []);

  const { data: deptData } = useFetch<{ data: Department[] }>({
    queryKey: ["departments"],
    endpoint: "departments",
    enabled: open,
  });
  const departments = deptData?.data ?? (Array.isArray(deptData) ? (deptData as any) : []);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `auth/staff/${staff?.id}` : "auth/staff",
    method: isEdit ? "put" : "post",
    mutationKey: ["staff-save"],
    invalidateKeys: [["staff"]],
    successMessage: isEdit ? "تم تعديل بيانات الموظف بنجاح" : "تم إضافة الموظف بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      role_id: Number(form.role_id),
      type: form.type,
      basic_salary: Number(form.basic_salary) || 0,
      is_active: form.is_active,
      department_id: form.department_id ? Number(form.department_id) : null,
    };
    if (!isEdit || form.password) payload.password = form.password;
    if (!isEdit) payload.achieved_target = 0;
    mutate(payload);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل بيانات الموظف" : "إضافة موظف جديد"} width="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="الاسم"
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
          />
          <TextField
            label="البريد الإلكتروني"
            name="email"
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label={isEdit ? "كلمة المرور (اتركها فارغة لعدم التغيير)" : "كلمة المرور"}
            name="password"
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <SelectField
            label="الوظيفة"
            name="type"
            required
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={STAFF_TYPES}
          />
          <SelectField
            label="الدور"
            name="role_id"
            required
            value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: e.target.value })}
            options={roles.map((r: Role) => ({ value: r.id, label: r.name }))}
          />
          <SelectField
            label="القسم"
            name="department_id"
            value={form.department_id}
            onChange={(e) => setForm({ ...form, department_id: e.target.value })}
            options={departments.map((d: Department) => ({ value: d.id, label: d.name }))}
          />
          <TextField
            label="الراتب الأساسي (ج.م)"
            name="basic_salary"
            type="number"
            min={0}
            value={form.basic_salary}
            onChange={(e) => setForm({ ...form, basic_salary: e.target.value })}
          />
        </div>
        <CheckboxField
          label="الموظف نشط"
          name="is_active"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
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

export default StaffFormModal;
