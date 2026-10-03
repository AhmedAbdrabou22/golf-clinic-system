import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "@/components/shared/Modal";
import {
  TextField,
  SelectField,
  CheckboxField,
} from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import {
  PACKAGE_TYPE_OPTIONS,
  type ClinicPackage,
  type PackageItemType,
  type PackageType,
} from "@/types/packages";

interface Option {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  pkg: ClinicPackage | null;
  departments: Option[];
  services: Option[];
  products: Option[];
}

interface Row {
  ref: string; // service_id أو product_id
  quantity: string;
  unit_price: string;
  notes: string;
}

const emptyRow = (): Row => ({ ref: "", quantity: "1", unit_price: "", notes: "" });

const initialForm = {
  name: "",
  description: "",
  department_id: "",
  type: "sessions" as PackageType,
  original_price: "",
  price: "",
  validity_days: "180",
  is_active: true,
};

const ITEM_TYPE: Record<PackageType, PackageItemType> = {
  sessions: "service",
  pulses: "pulse",
  units_volume: "product",
};

const toOptions = (list: Option[], placeholder: string) => [
  { value: "", label: placeholder },
  ...list.map((o) => ({ value: String(o.id), label: o.name })),
];

const PackageFormModal = ({
  open,
  onClose,
  pkg,
  departments,
  services,
  products,
}: Props) => {
  const isEdit = !!pkg;
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);

  useEffect(() => {
    if (!open) return;
    if (pkg) {
      setForm({
        name: pkg.name,
        description: pkg.description ?? "",
        department_id: String(pkg.department_id),
        type: pkg.type,
        original_price: String(Number(pkg.original_price)),
        price: String(Number(pkg.price)),
        validity_days: String(pkg.validity_days),
        is_active: !!pkg.is_active,
      });
      setRows(
        pkg.items.map((i) => ({
          ref: String(i.service_id ?? i.product_id ?? ""),
          quantity: String(Number(i.quantity)),
          unit_price: String(Number(i.unit_price)),
          notes: i.notes ?? "",
        }))
      );
    } else {
      setForm(initialForm);
      setRows([emptyRow()]);
    }
  }, [open, pkg]);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `packages/${pkg?.id}` : "packages",
    method: isEdit ? "put" : "post",
    mutationKey: ["package-save"],
    invalidateKeys: [["packages"]],
    successMessage: isEdit ? "تم تعديل العرض بنجاح" : "تم إضافة العرض بنجاح",
    onSuccess: () => onClose(),
  });

  const itemsTotal = useMemo(
    () =>
      rows.reduce(
        (s, r) => s + (Number(r.quantity) || 0) * (Number(r.unit_price) || 0),
        0
      ),
    [rows]
  );

  const isPulses = form.type === "pulses";
  const refOptions =
    form.type === "sessions"
      ? toOptions(services, "اختر الخدمة")
      : toOptions(products, "اختر المنتج");

  const changeType = (type: PackageType) => {
    setForm({ ...form, type });
    setRows([emptyRow()]); // شكل البنود بيختلف حسب النوع
  };

  const updateRow = (idx: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemType = ITEM_TYPE[form.type];

    mutate({
      name: form.name,
      description: form.description,
      department_id: Number(form.department_id),
      type: form.type,
      original_price: Number(form.original_price),
      price: Number(form.price),
      validity_days: Number(form.validity_days),
      is_active: form.is_active,
      items: rows.map((r) => ({
        item_type: itemType,
        service_id: itemType === "service" ? Number(r.ref) : null,
        ...(itemType === "product" ? { product_id: Number(r.ref) } : {}),
        quantity: Number(r.quantity),
        unit_price: Number(r.unit_price),
        notes: r.notes || null,
      })),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل العرض" : "إضافة عرض جديد"}
      width="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="اسم العرض"
          name="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          label="الوصف"
          name="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="القسم"
            name="department_id"
            required
            value={form.department_id}
            onChange={(e) => setForm({ ...form, department_id: e.target.value })}
            options={toOptions(departments, "اختر القسم")}
          />
          <SelectField
            label="نوع العرض"
            name="type"
            required
            disabled={isEdit}
            value={form.type}
            onChange={(e) => changeType(e.target.value as PackageType)}
            options={PACKAGE_TYPE_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <TextField
            label={`السعر الأصلي (بنود: ${itemsTotal})`}
            name="original_price"
            type="number"
            min={0}
            required
            value={form.original_price}
            onChange={(e) => setForm({ ...form, original_price: e.target.value })}
          />
          <TextField
            label="سعر الباقة"
            name="package_price"
            type="number"
            min={0}
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <TextField
            label="الصلاحية (يوم)"
            name="validity_days"
            type="number"
            min={1}
            required
            value={form.validity_days}
            onChange={(e) => setForm({ ...form, validity_days: e.target.value })}
          />
        </div>

        <CheckboxField
          label="العرض مفعّل"
          name="is_active"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />

        {/* البنود */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-ink">
              {form.type === "sessions"
                ? "الخدمات"
                : isPulses
                ? "رصيد النبضات"
                : "المنتجات (بالملي)"}
            </h4>
            {!isPulses && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setRows((p) => [...p, emptyRow()])}
              >
                <FiPlus size={15} /> بند جديد
              </button>
            )}
          </div>

          {rows.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 items-end gap-3 rounded-2xl border border-ink/10 p-3"
            >
              {!isPulses && (
                <div className="col-span-12 md:col-span-4">
                  <SelectField
                    label={form.type === "sessions" ? "الخدمة" : "المنتج"}
                    name={`ref-${idx}`}
                    required
                    value={row.ref}
                    onChange={(e) => updateRow(idx, { ref: e.target.value })}
                    options={refOptions}
                  />
                </div>
              )}
              <div className={isPulses ? "col-span-6" : "col-span-6 md:col-span-2"}>
                <TextField
                  label={isPulses ? "عدد النبضات" : "الكمية"}
                  name={`qty-${idx}`}
                  type="number"
                  min={0}
                  step={form.type === "units_volume" ? "0.1" : "1"}
                  required
                  value={row.quantity}
                  onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                />
              </div>
              <div className={isPulses ? "col-span-6" : "col-span-6 md:col-span-2"}>
                <TextField
                  label="سعر الوحدة"
                  name={`price-${idx}`}
                  type="number"
                  min={0}
                  required
                  value={row.unit_price}
                  onChange={(e) => updateRow(idx, { unit_price: e.target.value })}
                />
              </div>
              <div className={isPulses ? "col-span-12" : "col-span-10 md:col-span-3"}>
                <TextField
                  label="ملاحظات"
                  name={`notes-${idx}`}
                  value={row.notes}
                  onChange={(e) => updateRow(idx, { notes: e.target.value })}
                />
              </div>
              {!isPulses && rows.length > 1 && (
                <div className="col-span-2 md:col-span-1">
                  <button
                    type="button"
                    title="حذف البند"
                    onClick={() => setRows((p) => p.filter((_, i) => i !== idx))}
                    className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

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

export default PackageFormModal;