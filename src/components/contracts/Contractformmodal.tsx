import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "@/components/shared/Modal";
import { TextField, SelectField, TextareaField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import {
  CONTRACT_TYPES,
  DOCTOR_COMMISSION_MODES,
  SERVICE_COMMISSION_TYPES,
  CONTRACT_TARGET_TYPES,
} from "@/utils/constants";
import { Contract, ContractType, DepartmentCommission, ServiceCommission, ServiceCommissionType } from "@/utils/contractPayroll";

interface Props {
  open: boolean;
  onClose: () => void;
  contract: Contract | null;
}

type DoctorMode = "fixed_per_service" | "flat_percentage" | "target_escalation";

/**
 * ⚠️ افتراضات لازم تتأكد منها:
 * - endpoint "staff" بيرجع قايمة الموظفين (id + name) — لو مختلف غيّر endpoint هنا فقط
 * - endpoint "departments" و "services" بترجع بنفس شكل صفحاتهم الحالية
 */

const detectDoctorMode = (contract: Contract | null): DoctorMode => {
  if (!contract) return "flat_percentage";
  if (contract.service_commissions && contract.service_commissions.length > 0) return "fixed_per_service";
  if (contract.laser_service_commission_percentage !== undefined && contract.laser_service_commission_percentage !== null) {
    return "target_escalation";
  }
  return "flat_percentage";
};

const emptyDeptRow = (): DepartmentCommission & { _key: number } => ({
  _key: Math.random(),
  department_id: 0,
  percentage: 0,
});

const emptyServiceRow = (): ServiceCommission & { _key: number } => ({
  _key: Math.random(),
  service_id: 0,
  commission_type: "fixed",
  commission_value: 0,
});

const emptyForm = {
  user_id: "",
  title: "",
  contract_type: "" as ContractType | "",
  is_active: true,
  notes: "",

  hourly_rate: "",
  overtime_hour_rate: "",
  late_deduction_rate_per_hour: "",
  applies_department_commission: false,

  device_session_commission: "",
  medication_sales_percentage: "",
  holiday_day_rate: "",

  default_service_commission_type: "percentage" as ServiceCommissionType,
  default_service_commission_value: "",

  laser_service_commission_percentage: "",
  other_service_commission_percentage: "",
  has_target: false,
  target_amount: "",
  target_type: "doctor_income",
  target_achieved_hourly_rate: "",
  target_achieved_laser_percentage: "",
  target_achieved_other_percentage: "",
  target_bonus: "",
};

const ContractFormModal = ({ open, onClose, contract }: Props) => {
  const isEdit = !!contract;
  const [form, setForm] = useState(emptyForm);
  const [doctorMode, setDoctorMode] = useState<DoctorMode>("flat_percentage");
  const [deptRows, setDeptRows] = useState<(DepartmentCommission & { _key: number })[]>([]);
  const [serviceRows, setServiceRows] = useState<(ServiceCommission & { _key: number })[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm({
      user_id: contract ? String(contract.user_id) : "",
      title: contract?.title ?? "",
      contract_type: contract?.contract_type ?? "",
      is_active: contract?.is_active ?? true,
      notes: contract?.notes ?? "",

      hourly_rate: contract?.hourly_rate != null ? String(contract.hourly_rate) : "",
      overtime_hour_rate: contract?.overtime_hour_rate != null ? String(contract.overtime_hour_rate) : "",
      late_deduction_rate_per_hour:
        contract?.late_deduction_rate_per_hour != null ? String(contract.late_deduction_rate_per_hour) : "",
      applies_department_commission: contract?.applies_department_commission ?? false,

      device_session_commission:
        contract?.device_session_commission != null ? String(contract.device_session_commission) : "",
      medication_sales_percentage:
        contract?.medication_sales_percentage != null ? String(contract.medication_sales_percentage) : "",
      holiday_day_rate: contract?.holiday_day_rate != null ? String(contract.holiday_day_rate) : "",

      default_service_commission_type: contract?.default_service_commission_type ?? "percentage",
      default_service_commission_value:
        contract?.default_service_commission_value != null
          ? String(contract.default_service_commission_value)
          : "",

      laser_service_commission_percentage:
        contract?.laser_service_commission_percentage != null
          ? String(contract.laser_service_commission_percentage)
          : "",
      other_service_commission_percentage:
        contract?.other_service_commission_percentage != null
          ? String(contract.other_service_commission_percentage)
          : "",
      has_target: contract?.has_target ?? false,
      target_amount: contract?.target_amount != null ? String(contract.target_amount) : "",
      target_type: contract?.target_type ?? "doctor_income",
      target_achieved_hourly_rate:
        contract?.target_achieved_hourly_rate != null ? String(contract.target_achieved_hourly_rate) : "",
      target_achieved_laser_percentage:
        contract?.target_achieved_laser_percentage != null
          ? String(contract.target_achieved_laser_percentage)
          : "",
      target_achieved_other_percentage:
        contract?.target_achieved_other_percentage != null
          ? String(contract.target_achieved_other_percentage)
          : "",
      target_bonus: contract?.target_bonus != null ? String(contract.target_bonus) : "",
    });

    setDoctorMode(detectDoctorMode(contract));

    setDeptRows(
      contract?.department_commissions?.map((d) => ({ ...d, _key: Math.random() })) ?? []
    );
    setServiceRows(
      contract?.service_commissions?.map((s) => ({ ...s, _key: Math.random() })) ?? []
    );
  }, [open, contract]);

  const contractType = form.contract_type;

  // قوائم مساعدة — تتحمل فقط وقت الحاجة الفعلية للحقل
  const { data: staffData } = useFetch<any>({
    queryKey: ["staff-list"],
    endpoint: "auth/staff",
    enabled: open,
  });
  const staffList: any[] = staffData?.data ?? (Array.isArray(staffData) ? staffData : []);
  const staffOptions = useMemo(
    () =>
      staffList.map((s) => ({
        value: String(s.id),
        label: s.name ?? s.full_name ?? s.user?.name ?? `موظف #${s.id}`,
      })),
    [staffList]
  );

  const { data: departmentsData } = useFetch<any>({
    queryKey: ["departments-list"],
    endpoint: "departments",
    enabled: open && contractType === "receptionist" && form.applies_department_commission,
  });
  const departmentsList: any[] = departmentsData?.data ?? (Array.isArray(departmentsData) ? departmentsData : []);
  const departmentOptions = useMemo(
    () =>
      departmentsList.map((d) => ({
        value: String(d.id),
        label: d.name ?? d.title ?? `قسم #${d.id}`,
      })),
    [departmentsList]
  );

  const { data: servicesData } = useFetch<any>({
    queryKey: ["services-list"],
    endpoint: "services?per_page=-1",
    enabled: open && contractType === "doctor" && doctorMode === "fixed_per_service",
  });
  const servicesList: any[] = servicesData?.data ?? (Array.isArray(servicesData) ? servicesData : []);
  const serviceOptions = useMemo(
    () =>
      servicesList.map((s) => ({
        value: String(s.id),
        label: s.name ?? s.title ?? `خدمة #${s.id}`,
      })),
    [servicesList]
  );

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `contracts/${contract?.id}` : "contracts",
    method: isEdit ? "put" : "post",
    mutationKey: ["contract-save"],
    invalidateKeys: [["contracts"]],
    successMessage: isEdit ? "تم تعديل العقد بنجاح" : "تم إضافة العقد بنجاح",
    onSuccess: onClose,
  });

  const num = (v: string) => (v === "" ? undefined : Number(v));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const base: Record<string, any> = {
      user_id: Number(form.user_id),
      title: form.title,
      contract_type: form.contract_type,
      is_active: form.is_active,
      notes: form.notes || null,
    };

    if (contractType === "receptionist") {
      Object.assign(base, {
        hourly_rate: num(form.hourly_rate) ?? 0,
        overtime_hour_rate: num(form.overtime_hour_rate),
        late_deduction_rate_per_hour: num(form.late_deduction_rate_per_hour),
        applies_department_commission: form.applies_department_commission,
        department_commissions: form.applies_department_commission
          ? deptRows.map(({ department_id, percentage }) => ({
              department_id: Number(department_id),
              percentage: Number(percentage),
            }))
          : [],
      });
    }

    if (contractType === "nurse") {
      Object.assign(base, {
        device_session_commission: num(form.device_session_commission),
        medication_sales_percentage: num(form.medication_sales_percentage),
        holiday_day_rate: num(form.holiday_day_rate),
        overtime_hour_rate: num(form.overtime_hour_rate),
        late_deduction_rate_per_hour: num(form.late_deduction_rate_per_hour),
      });
    }

    if (contractType === "doctor") {
      if (doctorMode === "fixed_per_service") {
        Object.assign(base, {
          service_commissions: serviceRows.map(({ service_id, commission_type, commission_value }) => ({
            service_id: Number(service_id),
            commission_type,
            commission_value: Number(commission_value),
          })),
        });
      } else if (doctorMode === "flat_percentage") {
        Object.assign(base, {
          default_service_commission_type: form.default_service_commission_type,
          default_service_commission_value: num(form.default_service_commission_value),
        });
      } else if (doctorMode === "target_escalation") {
        Object.assign(base, {
          hourly_rate: num(form.hourly_rate),
          laser_service_commission_percentage: num(form.laser_service_commission_percentage),
          other_service_commission_percentage: num(form.other_service_commission_percentage),
          has_target: form.has_target,
          target_amount: num(form.target_amount),
          target_type: form.target_type,
          target_achieved_hourly_rate: num(form.target_achieved_hourly_rate),
          target_achieved_laser_percentage: num(form.target_achieved_laser_percentage),
          target_achieved_other_percentage: num(form.target_achieved_other_percentage),
          target_bonus: num(form.target_bonus),
        });
      }
    }

    mutate(base);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل العقد" : "عقد جديد"} width="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="الموظف"
            name="user_id"
            required
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
            options={staffOptions}
            placeholder="اختر الموظف"
          />
          <SelectField
            label="نوع العقد"
            name="contract_type"
            required
            value={form.contract_type}
            onChange={(e) => setForm({ ...form, contract_type: e.target.value as ContractType })}
            options={CONTRACT_TYPES}
            placeholder="اختر نوع العقد"
          />
        </div>

        <TextField
          label="عنوان العقد"
          name="title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="مثال: عقد موظف استقبال وعلاقات مرضى"
        />

        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ink/20 text-primary-600"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          العقد فعال
        </label>

        {/* ===== Receptionist ===== */}
        {contractType === "receptionist" && (
          <div className="flex flex-col gap-4 rounded-xl border border-ink/10 p-4">
            <div className="grid grid-cols-3 gap-4">
              <TextField
                label="سعر الساعة الإضافية"
                name="overtime_hour_rate"
                type="number"
                step="0.01"
                value={form.overtime_hour_rate}
                onChange={(e) => setForm({ ...form, overtime_hour_rate: e.target.value })}
              />
              <TextField
                label="خصم ساعة التأخير"
                name="late_deduction_rate_per_hour"
                type="number"
                step="0.01"
                value={form.late_deduction_rate_per_hour}
                onChange={(e) => setForm({ ...form, late_deduction_rate_per_hour: e.target.value })}
              />
              <TextField
                label="hourly_rate (افتراضي 0)"
                name="hourly_rate"
                type="number"
                step="0.01"
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-bold text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-ink/20 text-primary-600"
                checked={form.applies_department_commission}
                onChange={(e) => setForm({ ...form, applies_department_commission: e.target.checked })}
              />
              تطبيق نسبة عمولة من مبيعات أقسام معينة
            </label>

            {form.applies_department_commission && (
              <div className="flex flex-col gap-2">
                {deptRows.map((row, idx) => (
                  <div key={row._key} className="flex items-end gap-2">
                    <div className="flex-1">
                      <SelectField
                        label="القسم"
                        name={`dept_${idx}`}
                        value={String(row.department_id || "")}
                        onChange={(e) => {
                          const next = [...deptRows];
                          next[idx] = { ...row, department_id: Number(e.target.value) };
                          setDeptRows(next);
                        }}
                        options={departmentOptions}
                        placeholder="اختر القسم"
                      />
                    </div>
                    <div className="w-32">
                      <TextField
                        label="النسبة"
                        name={`dept_pct_${idx}`}
                        type="number"
                        step="0.01"
                        value={String(row.percentage || "")}
                        onChange={(e) => {
                          const next = [...deptRows];
                          next[idx] = { ...row, percentage: Number(e.target.value) };
                          setDeptRows(next);
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeptRows(deptRows.filter((_, i) => i !== idx))}
                      className="mb-1 rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDeptRows([...deptRows, emptyDeptRow()])}
                  className="btn-secondary self-start"
                >
                  <FiPlus size={15} /> إضافة قسم
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== Nurse ===== */}
        {contractType === "nurse" && (
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink/10 p-4">
            <TextField
              label="عمولة جلسة الجهاز (ج.م)"
              name="device_session_commission"
              type="number"
              step="0.01"
              value={form.device_session_commission}
              onChange={(e) => setForm({ ...form, device_session_commission: e.target.value })}
            />
            <TextField
              label="نسبة مبيعات الأدوية (%)"
              name="medication_sales_percentage"
              type="number"
              step="0.01"
              value={form.medication_sales_percentage}
              onChange={(e) => setForm({ ...form, medication_sales_percentage: e.target.value })}
            />
            <TextField
              label="بدل يوم الإجازة (ج.م)"
              name="holiday_day_rate"
              type="number"
              step="0.01"
              value={form.holiday_day_rate}
              onChange={(e) => setForm({ ...form, holiday_day_rate: e.target.value })}
            />
            <TextField
              label="سعر الساعة الإضافية"
              name="overtime_hour_rate"
              type="number"
              step="0.01"
              value={form.overtime_hour_rate}
              onChange={(e) => setForm({ ...form, overtime_hour_rate: e.target.value })}
            />
            <TextField
              label="خصم ساعة التأخير"
              name="late_deduction_rate_per_hour"
              type="number"
              step="0.01"
              value={form.late_deduction_rate_per_hour}
              onChange={(e) => setForm({ ...form, late_deduction_rate_per_hour: e.target.value })}
            />
          </div>
        )}

        {/* ===== Doctor ===== */}
        {contractType === "doctor" && (
          <div className="flex flex-col gap-4 rounded-xl border border-ink/10 p-4">
            <SelectField
              label="نمط احتساب عمولة الطبيب"
              name="doctor_mode"
              value={doctorMode}
              onChange={(e) => setDoctorMode(e.target.value as DoctorMode)}
              options={DOCTOR_COMMISSION_MODES.map((m) => ({ value: m.value, label: m.label }))}
            />
            <p className="-mt-2 text-xs text-ink/50">
              {DOCTOR_COMMISSION_MODES.find((m) => m.value === doctorMode)?.hint}
            </p>

            {doctorMode === "fixed_per_service" && (
              <div className="flex flex-col gap-2">
                {serviceRows.map((row, idx) => (
                  <div key={row._key} className="flex items-end gap-2">
                    <div className="flex-1">
                      <SelectField
                        label="الخدمة"
                        name={`service_${idx}`}
                        value={String(row.service_id || "")}
                        onChange={(e) => {
                          const next = [...serviceRows];
                          next[idx] = { ...row, service_id: Number(e.target.value) };
                          setServiceRows(next);
                        }}
                        options={serviceOptions}
                        placeholder="اختر الخدمة"
                      />
                    </div>
                    <div className="w-36">
                      <SelectField
                        label="نوع العمولة"
                        name={`service_type_${idx}`}
                        value={row.commission_type}
                        onChange={(e) => {
                          const next = [...serviceRows];
                          next[idx] = { ...row, commission_type: e.target.value as ServiceCommissionType };
                          setServiceRows(next);
                        }}
                        options={SERVICE_COMMISSION_TYPES}
                      />
                    </div>
                    <div className="w-28">
                      <TextField
                        label="القيمة"
                        name={`service_value_${idx}`}
                        type="number"
                        step="0.01"
                        value={String(row.commission_value || "")}
                        onChange={(e) => {
                          const next = [...serviceRows];
                          next[idx] = { ...row, commission_value: Number(e.target.value) };
                          setServiceRows(next);
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setServiceRows(serviceRows.filter((_, i) => i !== idx))}
                      className="mb-1 rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setServiceRows([...serviceRows, emptyServiceRow()])}
                  className="btn-secondary self-start"
                >
                  <FiPlus size={15} /> إضافة خدمة
                </button>
              </div>
            )}

            {doctorMode === "flat_percentage" && (
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="نوع العمولة الافتراضية"
                  name="default_service_commission_type"
                  value={form.default_service_commission_type}
                  onChange={(e) =>
                    setForm({ ...form, default_service_commission_type: e.target.value as ServiceCommissionType })
                  }
                  options={SERVICE_COMMISSION_TYPES}
                />
                <TextField
                  label="القيمة"
                  name="default_service_commission_value"
                  type="number"
                  step="0.01"
                  value={form.default_service_commission_value}
                  onChange={(e) => setForm({ ...form, default_service_commission_value: e.target.value })}
                />
              </div>
            )}

            {doctorMode === "target_escalation" && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <TextField
                    label="سعر الساعة (ج.م)"
                    name="hourly_rate"
                    type="number"
                    step="0.01"
                    value={form.hourly_rate}
                    onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                  />
                  <TextField
                    label="نسبة عمولة الليزر (%)"
                    name="laser_service_commission_percentage"
                    type="number"
                    step="0.01"
                    value={form.laser_service_commission_percentage}
                    onChange={(e) => setForm({ ...form, laser_service_commission_percentage: e.target.value })}
                  />
                  <TextField
                    label="نسبة عمولة باقي الخدمات (%)"
                    name="other_service_commission_percentage"
                    type="number"
                    step="0.01"
                    value={form.other_service_commission_percentage}
                    onChange={(e) => setForm({ ...form, other_service_commission_percentage: e.target.value })}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm font-bold text-ink">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-ink/20 text-primary-600"
                    checked={form.has_target}
                    onChange={(e) => setForm({ ...form, has_target: e.target.checked })}
                  />
                  تفعيل نظام التارجت والتصعيد
                </label>

                {form.has_target && (
                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-paper p-4">
                    <TextField
                      label="قيمة التارجت (ج.م)"
                      name="target_amount"
                      type="number"
                      step="0.01"
                      value={form.target_amount}
                      onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                    />
                    <SelectField
                      label="أساس احتساب التارجت"
                      name="target_type"
                      value={form.target_type}
                      onChange={(e) => setForm({ ...form, target_type: e.target.value })}
                      options={CONTRACT_TARGET_TYPES}
                    />
                    <TextField
                      label="سعر الساعة بعد التارجت"
                      name="target_achieved_hourly_rate"
                      type="number"
                      step="0.01"
                      value={form.target_achieved_hourly_rate}
                      onChange={(e) => setForm({ ...form, target_achieved_hourly_rate: e.target.value })}
                    />
                    <TextField
                      label="نسبة الليزر بعد التارجت (%)"
                      name="target_achieved_laser_percentage"
                      type="number"
                      step="0.01"
                      value={form.target_achieved_laser_percentage}
                      onChange={(e) => setForm({ ...form, target_achieved_laser_percentage: e.target.value })}
                    />
                    <TextField
                      label="نسبة باقي الخدمات بعد التارجت (%)"
                      name="target_achieved_other_percentage"
                      type="number"
                      step="0.01"
                      value={form.target_achieved_other_percentage}
                      onChange={(e) => setForm({ ...form, target_achieved_other_percentage: e.target.value })}
                    />
                    <TextField
                      label="بونص تحقيق التارجت (ج.م)"
                      name="target_bonus"
                      type="number"
                      step="0.01"
                      value={form.target_bonus}
                      onChange={(e) => setForm({ ...form, target_bonus: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <TextareaField
          label="ملاحظات"
          name="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="اختياري"
        />

        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button type="submit" disabled={isLoading || !contractType} className="btn-primary flex-1">
            {isLoading ? "جاري الحفظ..." : "حفظ العقد"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ContractFormModal;