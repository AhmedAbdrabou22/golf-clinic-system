import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "@/components/shared/Modal";
import { SelectField, TextField, TextareaField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import { INVOICE_TYPES, PAYMENT_METHODS } from "@/utils/constants";
import type { Invoice, InvoiceItemInput, Item, Patient, Service, Staff } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const emptyRow: InvoiceItemInput = { item_type: "service", service_id: null, product_id: null, quantity: 1 };

const initialForm = {
  patient_id: "",
  type: "consultation" as Invoice["type"],
  payment_method: "cash" as Invoice["payment_method"],
  doctor_id: "",
  nurse_id: "",
  discount: "0",
  notes: "",
};

const InvoiceFormModal = ({ open, onClose }: Props) => {
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState<InvoiceItemInput[]>([{ ...emptyRow }]);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setRows([{ ...emptyRow }]);
    }
  }, [open]);

  const requiresDoctor = form.type !== "direct_sale";
  const allowsNurse = form.type === "session";

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
  const nurses = staff.filter((s: Staff) => s.type === "nurse");

  const { data: serviceData } = useFetch<{ data: Service[] }>({
    queryKey: ["services"],
    endpoint: "services",
    enabled: open,
  });
  const services = serviceData?.data ?? (Array.isArray(serviceData) ? (serviceData as any) : []);

  const { data: itemData } = useFetch<{ data: Item[] }>({
    queryKey: ["items"],
    endpoint: "items",
    enabled: open,
  });
  const products = itemData?.data ?? (Array.isArray(itemData) ? (itemData as any) : []);

  const { mutate, isLoading } = useMutate({
    endpoint: "invoices",
    method: "post",
    mutationKey: ["invoice-save"],
    invalidateKeys: [["invoices"], ["items"]],
    successMessage: "تم إنشاء الفاتورة بنجاح",
    onSuccess: onClose,
  });

  const updateRow = (idx: number, patch: Partial<InvoiceItemInput>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));
  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      patient_id: Number(form.patient_id),
      appointment_id: null,
      type: form.type,
      payment_method: form.payment_method,
      doctor_id: requiresDoctor && form.doctor_id ? Number(form.doctor_id) : null,
      nurse_id: allowsNurse && form.nurse_id ? Number(form.nurse_id) : null,
      discount: Number(form.discount) || 0,
      notes: form.notes,
      items: rows.map((r) => ({
        item_type: r.item_type,
        service_id: r.item_type === "service" ? Number(r.service_id) : null,
        product_id: r.item_type === "product" ? Number(r.product_id) : null,
        quantity: Number(r.quantity),
      })),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="فاتورة جديدة" width="lg">
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
            label="نوع الفاتورة"
            name="type"
            required
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as Invoice["type"] })}
            options={INVOICE_TYPES}
          />
          <SelectField
            label="طريقة الدفع"
            name="payment_method"
            required
            value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value as Invoice["payment_method"] })}
            options={PAYMENT_METHODS}
          />
          <TextField
            label="الخصم (ج.م)"
            name="discount"
            type="number"
            min={0}
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
          />
          {requiresDoctor && (
            <SelectField
              label="الطبيب"
              name="doctor_id"
              required
              value={form.doctor_id}
              onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
              options={doctors.map((d: Staff) => ({ value: d.id, label: d.name }))}
            />
          )}
          {allowsNurse && (
            <SelectField
              label="الممرض/ة (اختياري)"
              name="nurse_id"
              value={form.nurse_id}
              onChange={(e) => setForm({ ...form, nurse_id: e.target.value })}
              options={nurses.map((n: Staff) => ({ value: n.id, label: n.name }))}
            />
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="field-label mb-0">أصناف الفاتورة</label>
            <button type="button" onClick={addRow} className="btn-ghost !px-3 !py-1.5 text-xs">
              <FiPlus size={14} /> إضافة صنف
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 items-end gap-2 rounded-lg border border-ink/10 p-3">
                <div className="col-span-6 sm:col-span-3">
                  <SelectField
                    label="النوع"
                    name={`type_${idx}`}
                    value={row.item_type}
                    onChange={(e) =>
                      updateRow(idx, {
                        item_type: e.target.value as "service" | "product",
                        service_id: null,
                        product_id: null,
                      })
                    }
                    options={[
                      { value: "service", label: "خدمة" },
                      { value: "product", label: "منتج / صنف" },
                    ]}
                  />
                </div>
                <div className="col-span-12 sm:col-span-5">
                  {row.item_type === "service" ? (
                    <SelectField
                      label="الخدمة"
                      name={`service_${idx}`}
                      value={row.service_id ?? ""}
                      onChange={(e) => updateRow(idx, { service_id: Number(e.target.value) })}
                      options={services.map((s: Service) => ({ value: s.id, label: `${s.name} — ${s.price} ج.م` }))}
                    />
                  ) : (
                    <SelectField
                      label="المنتج"
                      name={`product_${idx}`}
                      value={row.product_id ?? ""}
                      onChange={(e) => updateRow(idx, { product_id: Number(e.target.value) })}
                      options={products.map((p: Item) => ({ value: p.id, label: `${p.name} — ${p.selling_price} ج.م` }))}
                    />
                  )}
                </div>
                <div className="col-span-4 sm:col-span-3">
                  <TextField
                    label="الكمية"
                    name={`qty_${idx}`}
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={rows.length === 1}
                    className="rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10 disabled:opacity-30"
                    aria-label="حذف الصف"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TextareaField
          label="ملاحظات"
          name="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="mt-1 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? "جاري الحفظ..." : "حفظ الفاتورة"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceFormModal;
