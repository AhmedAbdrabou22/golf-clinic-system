import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiArrowRight, FiInfo, FiUser, FiTag, FiPackage } from "react-icons/fi";
import PageHeader from "@/components/shared/PageHeader";
import { SelectField, TextField, TextareaField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import { INVOICE_TYPES, PAYMENT_METHODS, ITEM_TYPES, labelOf } from "@/utils/constants";
import type { Invoice, InvoiceItemInput, Item, Patient, Service, Staff } from "@/types";

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

const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState<InvoiceItemInput[]>([{ ...emptyRow }]);

  const requiresDoctor = form.type !== "direct_sale";
  const allowsNurse = form.type === "session";

  const { data: patientData, isLoading: patientsLoading } = useFetch<{ data: Patient[] }>({
    queryKey: ["patients"],
    endpoint: "patients",
  });
  const patients = patientData?.data ?? (Array.isArray(patientData) ? (patientData as any) : []);

  const { data: staffData } = useFetch<{ data: Staff[] }>({
    queryKey: ["staff"],
    endpoint: "auth/staff",
  });
  const staff = staffData?.data ?? (Array.isArray(staffData) ? (staffData as any) : []);
  const doctors = staff.filter((s: Staff) => s.type === "doctor");
  const nurses = staff.filter((s: Staff) => s.type === "nurse");

  const { data: serviceData } = useFetch<{ data: Service[] }>({
    queryKey: ["services"],
    endpoint: "services",
  });
  const services = serviceData?.data ?? (Array.isArray(serviceData) ? (serviceData as any) : []);

  const { data: itemData } = useFetch<{ data: Item[] }>({
    queryKey: ["items"],
    endpoint: "items",
  });
  const products = itemData?.data ?? (Array.isArray(itemData) ? (itemData as any) : []);

  const { mutate, isLoading } = useMutate({
    endpoint: "invoices",
    method: "post",
    mutationKey: ["invoice-save"],
    invalidateKeys: [["invoices"], ["items"]],
    successMessage: "تم إنشاء الفاتورة بنجاح",
    onSuccess: () => navigate("/invoices"),
  });

  const findService = (id?: number | null) => services.find((s: Service) => s.id === id);
  const findProduct = (id?: number | null) => products.find((p: Item) => p.id === id);

  const updateRow = (idx: number, patch: Partial<InvoiceItemInput>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));
  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);

  // إجمالي كل صف + إجمالي الفاتورة كاملة — بيتحدث لحظيًا مع أي اختيار
  const rowsWithTotals = useMemo(
    () =>
      rows.map((row) => {
        const svc = row.item_type === "service" ? findService(row.service_id) : null;
        const prod = row.item_type === "product" ? findProduct(row.product_id) : null;
        const unitPrice = svc ? Number(svc.price) : prod ? Number(prod.selling_price) : 0;
        return { row, svc, prod, unitPrice, subtotal: unitPrice * Number(row.quantity || 0) };
      }),
    [rows, services, products]
  );
  const itemsTotal = rowsWithTotals.reduce((sum, r) => sum + r.subtotal, 0);
  const discountValue = Number(form.discount) || 0;
  const grandTotal = Math.max(itemsTotal - discountValue, 0);

  const selectedPatient = patients.find((p: Patient) => String(p.id) === form.patient_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      patient_id: Number(form.patient_id),
      appointment_id: null,
      type: form.type,
      payment_method: form.payment_method,
      doctor_id: requiresDoctor && form.doctor_id ? Number(form.doctor_id) : null,
      nurse_id: allowsNurse && form.nurse_id ? Number(form.nurse_id) : null,
      discount: discountValue,
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
    <div>
      <PageHeader
        title="فاتورة جديدة"
        subtitle="أنشئ فاتورة كشف أو جلسة أو بيع مباشر"
        action={
          <button className="btn-secondary" onClick={() => navigate("/invoices")}>
            <FiArrowRight size={16} /> رجوع للفواتير
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ===== العمود الرئيسي: بيانات الفاتورة + الأصناف ===== */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* بيانات أساسية */}
          <div className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiUser className="text-primary-500" size={18} />
              بيانات الفاتورة
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                label="المريض"
                name="patient_id"
                required
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                options={patients.map((p: Patient) => ({
                  value: p.id,
                  label: `${p.name} — ${p.phone}`,
                }))}
                hint={patientsLoading ? "جاري تحميل المرضى..." : undefined}
              />
              <SelectField
                label="نوع الفاتورة"
                name="type"
                required
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as Invoice["type"], doctor_id: "", nurse_id: "" })
                }
                options={INVOICE_TYPES}
              />
              <SelectField
                label="طريقة الدفع"
                name="payment_method"
                required
                value={form.payment_method}
                onChange={(e) =>
                  setForm({ ...form, payment_method: e.target.value as Invoice["payment_method"] })
                }
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

            {/* كارت معلومات المريض المختار */}
            {selectedPatient && (
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg bg-mint-100/70 px-4 py-2.5 text-xs font-bold text-primary-700">
                <span className="flex items-center gap-1 text-primary-600">
                  <FiInfo size={13} /> بيانات المريض:
                </span>
                <span>
                  الهاتف: <span className="text-ink/70" dir="ltr">{selectedPatient.phone}</span>
                </span>
                <span>
                  السن: <span className="text-ink/70">{selectedPatient.age}</span>
                </span>
                <span>
                  النوع: <span className="text-ink/70">{selectedPatient.gender === "male" ? "ذكر" : "أنثى"}</span>
                </span>
              </div>
            )}
          </div>

          {/* أصناف الفاتورة */}
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
                <FiTag className="text-primary-500" size={18} />
                أصناف الفاتورة
              </h2>
              <button type="button" onClick={addRow} className="btn-ghost !px-3 !py-1.5 text-xs">
                <FiPlus size={14} /> إضافة صنف
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {rowsWithTotals.map(({ row, svc, prod, subtotal }, idx) => (
                <div key={idx} className="rounded-xl border border-ink/10 p-3.5">
                  <div className="grid grid-cols-12 items-end gap-2">
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
                          options={services.map((s: Service) => ({
                            value: s.id,
                            label: `${s.name} — ${s.price} ج.م`,
                          }))}
                        />
                      ) : (
                        <SelectField
                          label="المنتج"
                          name={`product_${idx}`}
                          value={row.product_id ?? ""}
                          onChange={(e) => updateRow(idx, { product_id: Number(e.target.value) })}
                          options={products.map((p: Item) => ({
                            value: p.id,
                            label: `${p.name} — ${p.selling_price} ج.م`,
                          }))}
                        />
                      )}
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <TextField
                        label="الكمية"
                        name={`qty_${idx}`}
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-1">
                      <p className="field-label mb-1.5 truncate">الإجمالي</p>
                      <p className="py-2.5 text-sm font-extrabold text-primary-600">
                        {subtotal ? subtotal.toFixed(2) : "0.00"}
                      </p>
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

                  {/* معلومات كاملة عن الخدمة أو المنتج المختار */}
                  {svc && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-primary-700">
                      <span className="flex items-center gap-1 text-primary-600">
                        <FiInfo size={13} /> بيانات الخدمة:
                      </span>
                      <span>
                        القسم: <span className="text-ink/70">{svc.department?.name ?? "—"}</span>
                      </span>
                      <span>
                        النوع الطبي:{" "}
                        <span className="text-ink/70">
                          {svc.type === "consultation" ? "كشف" : svc.type === "device" ? "جهاز" : "جلسة"}
                        </span>
                      </span>
                      <span>
                        السعر الأساسي: <span className="text-ink/70">{svc.price} ج.م</span>
                      </span>
                      {svc.items && svc.items.length > 0 && (
                        <span>
                          الأصناف المستهلكة: <span className="text-ink/70">{svc.items.length} صنف</span>
                        </span>
                      )}
                    </div>
                  )}
                  {prod && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-primary-700">
                      <span className="flex items-center gap-1 text-primary-600">
                        <FiInfo size={13} /> بيانات المنتج:
                      </span>
                      <span>
                        النوع: <span className="text-ink/70">{labelOf(ITEM_TYPES, prod.type)}</span>
                      </span>
                      <span>
                        الوحدة: <span className="text-ink/70">{prod.unit}</span>
                      </span>
                      <span>
                        المتاح بالمخزن:{" "}
                        <span className={Number(prod.current_stock) <= 5 ? "text-coral-600" : "text-ink/70"}>
                          {prod.current_stock}
                        </span>
                      </span>
                      <span>
                        سعر البيع: <span className="text-ink/70">{prod.selling_price} ج.م</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <TextareaField
              label="ملاحظات"
              name="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية على الفاتورة..."
            />
          </div>
        </div>

        {/* ===== العمود الجانبي: ملخص الفاتورة ===== */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 flex flex-col gap-4 p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiPackage className="text-primary-500" size={18} />
              ملخص الفاتورة
            </h2>

            <div className="flex flex-col gap-2 rounded-xl bg-mint-100/70 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink/55">عدد الأصناف</span>
                <span className="font-bold text-ink">{rows.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink/55">إجمالي الأصناف</span>
                <span className="font-bold text-ink">{itemsTotal.toFixed(2)} ج.م</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink/55">الخصم</span>
                <span className="font-bold text-coral-600">- {discountValue.toFixed(2)} ج.م</span>
              </div>
              <div className="flex items-center justify-between border-t border-ink/10 pt-2">
                <span className="font-bold text-ink/70">الإجمالي المطلوب</span>
                <span className="font-display text-xl font-extrabold text-primary-600">
                  {grandTotal.toFixed(2)} ج.م
                </span>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading ? "جاري الحفظ..." : "حفظ الفاتورة"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/invoices")}
              className="btn-secondary w-full py-3"
            >
              إلغاء
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreatePage;