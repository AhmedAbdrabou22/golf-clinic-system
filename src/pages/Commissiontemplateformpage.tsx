import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiTrash2, FiArrowRight } from "react-icons/fi";
import PageHeader from "@/components/shared/PageHeader";
import { TextField, SelectField, CheckboxField, TextareaField } from "@/components/shared/FormField";
import SearchableSelect from "@/components/shared/SearchableSelect";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import { SERVICE_COMMISSION_TYPES } from "@/utils/constants";
import type { Department } from "@/types";
import type { ServiceCommissionType } from "@/utils/contractPayroll";
import { CommissionTemplate, CommissionTemplatePayload } from "@/types/Commissiontemplate";

type ItemRow = {
  _key: number;
  service_id: number;
  doctor_service_price: string;
  is_laser: boolean;
  commission_type: ServiceCommissionType;
  commission_value: string;
  target_commission_value: string;
};

const initialForm = {
  name: "",
  description: "",
  department_id: "",
  is_active: true,
};

const emptyRow = (): ItemRow => ({
  _key: Math.random(),
  service_id: 0,
  doctor_service_price: "",
  is_laser: false,
  commission_type: "percentage",
  commission_value: "",
  target_commission_value: "",
});

const CommissionTemplateFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ===== جلب الخطة (وضع التعديل فقط) =====
  const { data: templateResp } = useFetch<any>({
    queryKey: ["commission-template", id],
    endpoint: `commission-templates/${id}`,
    enabled: isEdit,
  });
  const template: CommissionTemplate | null =
    templateResp?.data?.id ? templateResp.data : templateResp?.id ? templateResp : null;

  useEffect(() => {
    if (!template) return;
    setForm({
      name: template.name ?? "",
      description: template.description ?? "",
      department_id: template.department_id != null ? String(template.department_id) : "",
      is_active: template.is_active ?? true,
    });
    setRows(
      (template.items ?? []).map((item) => ({
        _key: Math.random(),
        service_id: item.service_id,
        doctor_service_price: String(item.doctor_service_price ?? ""),
        is_laser: !!item.is_laser,
        commission_type: item.commission_type,
        commission_value: String(item.commission_value ?? ""),
        target_commission_value: String(item.target_commission_value ?? ""),
      }))
    );
  }, [template]);

  // ===== الأقسام =====
  const { data: deptData } = useFetch<any>({ queryKey: ["departments"], endpoint: "departments" });
  const departments: Department[] = deptData?.data ?? (Array.isArray(deptData) ? deptData : []);

  // ===== الخدمات (مفلترة حسب القسم المختار) =====
  const departmentId = form.department_id ? Number(form.department_id) : null;

  const { data: servicesData } = useFetch<any>({
    queryKey: ["services-list", departmentId],
    endpoint: "services",
    params: { per_page: -1, department_id: departmentId },
    enabled: !!departmentId,
  });
  const servicesList: any[] = servicesData?.data ?? (Array.isArray(servicesData) ? servicesData : []);

  const serviceOptions = useMemo(
    () => servicesList.map((s) => ({ value: String(s.id), label: s.name ?? s.title ?? `خدمة #${s.id}` })),
    [servicesList]
  );

  const getServicePrice = (serviceId: number): number => {
    const found = servicesList.find((s) => Number(s.id) === Number(serviceId));
    return Number(found?.price ?? found?.cost ?? 0);
  };

  // ===== helpers للصفوف =====
  const updateRow = (idx: number, patch: Partial<ItemRow>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  // ✅ تغيير القسم بيفضّي الخدمات لأن الخدمات مرتبطة بالقسم
  const handleDepartmentChange = (value: string) => {
    setForm({ ...form, department_id: value });
    setRows([]);
  };

  // ===== الحفظ =====
  const { mutate: saveTemplate, isLoading: saving } = useMutate({
    endpoint: isEdit ? `commission-templates/${id}` : "commission-templates",
    method: isEdit ? "put" : "post",
    mutationKey: ["commission-template-save"],
    invalidateKeys: [["commission-templates"], ["commission-template", id]],
    successMessage: isEdit ? "تم تعديل الخطة بنجاح" : "تم إضافة الخطة بنجاح",
    onSuccess: () => navigate("/commission-templates"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!departmentId) {
      setError("لازم تختار القسم الأول");
      return;
    }
    if (rows.length === 0) {
      setError("لازم تضيف خدمة واحدة على الأقل");
      return;
    }
    if (rows.some((r) => !r.service_id)) {
      setError("فيه صف مش مختار فيه خدمة");
      return;
    }
    const ids = rows.map((r) => r.service_id);
    if (new Set(ids).size !== ids.length) {
      setError("فيه خدمة مكررة في الخطة");
      return;
    }

    const payload: CommissionTemplatePayload = {
      name: form.name,
      description: form.description,
      department_id: departmentId,
      is_active: form.is_active,
      items: rows.map((r) => ({
        service_id: r.service_id,
        doctor_service_price: Number(r.doctor_service_price) || 0,
        is_laser: r.is_laser,
        commission_type: r.commission_type,
        commission_value: Number(r.commission_value) || 0,
        target_commission_value: Number(r.target_commission_value) || 0,
      })),
    };

    saveTemplate(payload);
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "تعديل خطة عمولات" : "إضافة خطة عمولات"}
        action={
          <button className="btn-secondary" onClick={() => navigate("/commission-templates")}>
            <FiArrowRight size={16} /> رجوع للقائمة
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="اسم الخطة"
            name="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <SelectField
            label="القسم"
            name="department_id"
            required
            value={form.department_id}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            placeholder="اختر القسم"
          />
        </div>

        <TextareaField
          label="الوصف"
          name="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="اختياري"
        />

        <CheckboxField
          label="الخطة فعالة"
          name="is_active"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />

        {/* ===== بنود الخطة ===== */}
        <div className="flex flex-col gap-2 rounded-xl border border-ink/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">الخدمات والنسب</p>
            <p className="text-xs text-ink/40">
              سعر المحاسبة = السعر اللي الطبيب بيتحاسب عليه (مش سعر الفاتورة)
            </p>
          </div>

          {!departmentId ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              ⚠️ اختار القسم الأول عشان تقدر تختار الخدمات.
            </p>
          ) : rows.length === 0 ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              لازم تضيف خدمة واحدة على الأقل.
            </p>
          ) : null}

          {rows.map((row, idx) => (
            <div
              key={row._key}
              className="flex flex-wrap items-end gap-2 rounded-lg border border-ink/10 p-2"
            >
              <div className="min-w-[180px] flex-1">
                <SearchableSelect
                  label="الخدمة"
                  value={row.service_id || null}
                  onChange={(val: string | number) => {
                    const serviceId = Number(val);
                    updateRow(idx, {
                      service_id: serviceId,
                      // نملا سعر المحاسبة من سعر الخدمة (تقدر تعدله بعدها)
                      doctor_service_price: String(getServicePrice(serviceId)),
                    });
                  }}
                  options={serviceOptions}
                  placeholder="ابحث عن خدمة..."
                />
              </div>

              <div className="w-32">
                <TextField
                  label="سعر محاسبة الطبيب"
                  name={`item_price_${idx}`}
                  type="number"
                  step="0.01"
                  value={row.doctor_service_price}
                  onChange={(e) => updateRow(idx, { doctor_service_price: e.target.value })}
                />
              </div>

              <div className="w-32">
                <SelectField
                  label="نوع العمولة"
                  name={`item_type_${idx}`}
                  value={row.commission_type}
                  onChange={(e) =>
                    updateRow(idx, { commission_type: e.target.value as ServiceCommissionType })
                  }
                  options={SERVICE_COMMISSION_TYPES}
                />
              </div>

              <div className="w-24">
                <TextField
                  label="القيمة"
                  name={`item_value_${idx}`}
                  type="number"
                  step="0.01"
                  value={row.commission_value}
                  onChange={(e) => updateRow(idx, { commission_value: e.target.value })}
                />
              </div>

              <div className="w-28">
                <TextField
                  label="القيمة بعد التارجت"
                  name={`item_target_value_${idx}`}
                  type="number"
                  step="0.01"
                  value={row.target_commission_value}
                  onChange={(e) => updateRow(idx, { target_commission_value: e.target.value })}
                />
              </div>

              <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink/20 text-primary-600"
                  checked={row.is_laser}
                  onChange={(e) => updateRow(idx, { is_laser: e.target.checked })}
                />
                ليزر
              </label>

              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="mb-1 rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            disabled={!departmentId}
            onClick={() => setRows((prev) => [...prev, emptyRow()])}
            className="btn-secondary self-start disabled:opacity-40"
          >
            <FiPlus size={15} /> إضافة خدمة
          </button>
        </div>

        {error && <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-500">{error}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/commission-templates")}
            className="btn-secondary flex-1"
          >
            إلغاء
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديل" : "حفظ الخطة"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommissionTemplateFormPage;