


// import { useMemo, useState } from "react";
// import { FiPlus, FiTrash2, FiInfo, FiUser, FiTag, FiPackage } from "react-icons/fi";
// import { SelectField, TextField, TextareaField } from "@/components/shared/FormField";
// import useFetch from "@/hooks/useFetch";
// import useMutate from "@/hooks/useMutate";
// import PatientFormModal from "@/components/patients/PatientFormModal";
// import { INVOICE_TYPES, PAYMENT_METHODS, ITEM_TYPES, labelOf } from "@/utils/constants";
// import type { Invoice, InvoiceItemInput, Item, Patient, Service, Staff } from "@/types";
// import InvoicePrintModal from "./Invoiceprintmodal";

// interface SelectedServiceItem {
//   item_id: number;
//   quantity: number;
//   price: number;
// }

// const emptyRow: any = {
//   item_type: "service",
//   service_id: null,
//   product_id: null,
//   quantity: 1,
//   service_items_ids: [] as SelectedServiceItem[],
// };

// const initialForm = {
//   patient_id: "",
//   type: "consultation" as Invoice["type"],
//   payment_method: "cash" as Invoice["payment_method"],
//   doctor_id: "",
//   nurse_id: "",
//   discount: "0",
//   paid_amount: "",
//   notes: "",
// };

// interface InvoiceCreateFormProps {
//   onSuccess?: (invoice?: Invoice) => void;
//   onCancel?: () => void;
// }

// const InvoiceCreateForm = ({ onSuccess, onCancel }: InvoiceCreateFormProps) => {
//   const [form, setForm] = useState(initialForm);
//   const [rows, setRows] = useState<InvoiceItemInput[]>([{ ...emptyRow }]);
//   const [patientModalOpen, setPatientModalOpen] = useState(false);
//   const [partialPayment, setPartialPayment] = useState(false);

//   // ===== شاشة الطباعة بعد الحفظ =====
//   const [printOpen, setPrintOpen] = useState(false);
//   const [createdInvoice, setCreatedInvoice] = useState<any>(null);

//   const requiresDoctor = form.type !== "direct_sale";
//   const allowsNurse = form.type === "session";

//   const { data: patientData, isLoading: patientsLoading } = useFetch<{ data: Patient[] }>({
//     queryKey: ["patients"],
//     endpoint: "patients",
//   });
//   const patients = patientData?.data ?? (Array.isArray(patientData) ? (patientData as any) : []);

//   const { data: staffData } = useFetch<{ data: Staff[] }>({
//     queryKey: ["staff"],
//     endpoint: "auth/staff",
//   });
//   const staff = staffData?.data ?? (Array.isArray(staffData) ? (staffData as any) : []);
//   const doctors = staff.filter((s: Staff) => s.type === "doctor");
//   const nurses = staff.filter((s: Staff) => s.type === "nurse");

//   const { data: serviceData } = useFetch<{ data: Service[] }>({
//     queryKey: ["services"],
//     endpoint: "services",
//   });
//   const services = serviceData?.data ?? (Array.isArray(serviceData) ? (serviceData as any) : []);

//   const { data: itemData } = useFetch<{ data: Item[] }>({
//     queryKey: ["items"],
//     endpoint: "items?type=retailable",
//   });
//   const products = itemData?.data ?? (Array.isArray(itemData) ? (itemData as any) : []);

//   const { mutate, isLoading } = useMutate({
//     endpoint: "invoices",
//     method: "post",
//     mutationKey: ["invoice-save"],
//     invalidateKeys: [["invoices"], ["items"]],
//     successMessage: "تم إنشاء الفاتورة بنجاح",
//     onSuccess: (invoice: any) => {
//       const saved = invoice?.data ?? invoice; // بيتعامل مع الشكلين {data:{...}} أو {...} مباشرة
//       setCreatedInvoice(saved);
//       setPrintOpen(true);
//       setForm(initialForm);
//       setRows([{ ...emptyRow }]);
//       setPartialPayment(false);
//       onSuccess?.(saved);
//     },
//   });

//   const findService = (id?: number | null) => services.find((s: Service) => s.id === id);
//   const findProduct = (id?: number | null) => products.find((p: Item) => p.id === id);

//   const updateRow = (idx: number, patch: Partial<InvoiceItemInput>) =>
//     setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
//   const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));
//   const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);

//   // ==== Multi select للأصناف المستهلكة ====
//   const toggleServiceItem = (idx: number, item: any) => {
//     setRows((prev) =>
//       prev.map((r, i) => {
//         if (i !== idx) return r;
//         const current: SelectedServiceItem[] = r.service_items_ids ?? [];
//         const exists = current.some((x) => x.item_id === item.id);

//         return {
//           ...r,
//           service_items_ids: exists
//             ? current.filter((x) => x.item_id !== item.id)
//             : [
//               ...current,
//               {
//                 item_id: item.id,
//                 quantity: Number(item.quantity ?? 0),
//                 price: Number(item.price ?? 0),
//               },
//             ],
//         };
//       })
//     );
//   };

//   const updateServiceItemField = (
//     idx: number,
//     itemId: number,
//     field: "quantity" | "price",
//     value: number
//   ) => {
//     setRows((prev) =>
//       prev.map((r, i) =>
//         i === idx
//           ? {
//             ...r,
//             service_items_ids: (r.service_items_ids ?? []).map((x) =>
//               x.item_id === itemId ? { ...x, [field]: value } : x
//             ),
//           }
//           : r
//       )
//     );
//   };

//   const rowsWithTotals = useMemo(
//     () =>
//       rows.map((row) => {
//         const svc = row.item_type === "service" ? findService(row.service_id) : null;
//         const prod = row.item_type === "product" ? findProduct(row.product_id) : null;
//         const unitPrice = svc ? Number(svc.price) : prod ? Number(prod.selling_price) : 0;

//         // إجمالي الأصناف المستهلكة للخدمة
//         const serviceItemsTotal =
//           row.item_type === "service"
//             ? (row.service_items_ids ?? []).reduce(
//               (sum, x) => sum + 1 * Number(x.price),
//               0
//             )
//             : 0;

//         const subtotal = svc
//           ? unitPrice + serviceItemsTotal
//           : unitPrice * Number(row.quantity || 0);

//         return { row, svc, prod, unitPrice, subtotal, serviceItemsTotal };
//       }),
//     [rows, services, products]
//   );

//   const itemsTotal = rowsWithTotals.reduce((sum, r) => sum + r.subtotal, 0);
//   const discountValue = Number(form.discount) || 0;
//   const grandTotal = Math.max(itemsTotal - discountValue, 0);

//   // لو مفيش دفع جزئي معناه هيتدفع كل المبلغ (وهيتبعت paid_amount فاضي للباك إند)
//   const paidValue = partialPayment ? Number(form.paid_amount) || 0 : grandTotal;
//   const remainingValue = Math.max(grandTotal - paidValue, 0);

//   const selectedPatient = patients.find((p: Patient) => String(p.id) === form.patient_id);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     mutate({
//       patient_id: Number(form.patient_id),
//       appointment_id: null,
//       type: form.type,
//       payment_method: form.payment_method,
//       doctor_id: requiresDoctor && form.doctor_id ? Number(form.doctor_id) : null,
//       nurse_id: allowsNurse && form.nurse_id ? Number(form.nurse_id) : null,
//       discount: discountValue,
//       // دفع جزئي فقط اللي بيبعت المبلغ، غير كدا بيتسيب فاضي = دفع كامل
//       ...(partialPayment ? { paid_amount: Number(form.paid_amount) || 0 } : {}),
//       notes: form.notes,
//       items: rows.map((r) => {
//         if (r.item_type === "service") {
//           return {
//             item_type: "service",
//             service_id: Number(r.service_id),
//             product_id: null,
//             ...(r.service_items_ids && r.service_items_ids.length > 0
//               ? {
//                 service_items_ids: r.service_items_ids.map((x) => x.item_id),
//               }
//               : {}),
//           };
//         }
//         return {
//           item_type: "product",
//           service_id: null,
//           product_id: Number(r.product_id),
//           quantity: Number(r.quantity),
//         };
//       }),
//     });
//   };

//   return (
//     <>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 xl:grid-cols-2">
//         <div className="flex flex-col gap-5 xl:col-span-2">
//           {/* بيانات أساسية (بدون فلوس هنا) */}
//           <div className="card p-5">
//             <h2 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold text-ink">
//               <FiUser className="text-primary-500" size={18} />
//               بيانات الفاتورة
//             </h2>
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <div className="flex items-end gap-2">
//                 <div className="flex-1">
//                   <SelectField
//                     label="المريض"
//                     name="patient_id"
//                     required
//                     value={form.patient_id}
//                     onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
//                     options={patients.map((p: Patient) => ({
//                       value: p.id,
//                       label: `${p.name}`,
//                     }))}
//                     hint={patientsLoading ? "جاري تحميل المرضى..." : undefined}
//                   />
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => setPatientModalOpen(true)}
//                   className="mb-[1px] shrink-0 rounded-lg border border-ink/10 p-2.5 text-primary-600 hover:bg-primary-500/10"
//                   aria-label="إضافة مريض جديد"
//                   title="إضافة مريض جديد"
//                 >
//                   <FiPlus size={18} />
//                 </button>
//               </div>
//               <SelectField
//                 label="نوع الفاتورة"
//                 name="type"
//                 required
//                 value={form.type}
//                 onChange={(e) =>
//                   setForm({ ...form, type: e.target.value as Invoice["type"], doctor_id: "", nurse_id: "" })
//                 }
//                 options={INVOICE_TYPES}
//               />
//               <SelectField
//                 label="طريقة الدفع"
//                 name="payment_method"
//                 required
//                 value={form.payment_method}
//                 onChange={(e) =>
//                   setForm({ ...form, payment_method: e.target.value as Invoice["payment_method"] })
//                 }
//                 options={PAYMENT_METHODS}
//               />
//               {requiresDoctor && (
//                 <SelectField
//                   label="الطبيب"
//                   name="doctor_id"
//                   required
//                   value={form.doctor_id}
//                   onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
//                   options={doctors.map((d: Staff) => ({ value: d.id, label: d.name }))}
//                 />
//               )}
//               {allowsNurse && (
//                 <SelectField
//                   label="الممرض/ة (اختياري)"
//                   name="nurse_id"
//                   value={form.nurse_id}
//                   onChange={(e) => setForm({ ...form, nurse_id: e.target.value })}
//                   options={nurses.map((n: Staff) => ({ value: n.id, label: n.name }))}
//                 />
//               )}
//             </div>

//             {/* {selectedPatient && (
//               <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg bg-mint-100/70 px-4 py-2.5 text-xs font-bold text-primary-700">
//                 <span className="flex items-center gap-1 text-primary-600">
//                   <FiInfo size={13} /> بيانات المريض:
//                 </span>
//                 <span>
//                   الهاتف: <span className="text-ink/70" dir="ltr">{selectedPatient.phone}</span>
//                 </span>
//                 <span>
//                   السن: <span className="text-ink/70">{selectedPatient.age}</span>
//                 </span>
//                 <span>
//                   النوع: <span className="text-ink/70">{selectedPatient.gender === "male" ? "ذكر" : "أنثى"}</span>
//                 </span>
//               </div>
//             )} */}
//           </div>

//           {/* أصناف الفاتورة — تختار الخدمات هنا قبل أي كلام فلوس */}
//           <div className="card p-5">
//             <div className="mb-4 flex items-center justify-between">
//               <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
//                 <FiTag className="text-primary-500" size={18} />
//                 أصناف الفاتورة
//               </h2>
//               <button type="button" onClick={addRow} className="btn-ghost !px-3 !py-1.5 text-xs">
//                 <FiPlus size={14} /> إضافة صنف
//               </button>
//             </div>

//             <div className="flex flex-col gap-3">
//               {rowsWithTotals.map(({ row, svc, prod, subtotal }, idx) => (
//                 <div key={idx} className="rounded-xl border border-ink/10 p-3.5">
//                   <div className="grid grid-cols-12 items-end gap-2">
//                     <div className="col-span-6 sm:col-span-3">
//                       <SelectField
//                         label="النوع"
//                         name={`type_${idx}`}
//                         value={row.item_type}
//                         onChange={(e) =>
//                           updateRow(idx, {
//                             item_type: e.target.value as "service" | "product",
//                             service_id: null,
//                             product_id: null,
//                             service_items_ids: [],
//                             quantity: 1,
//                           })
//                         }
//                         options={[
//                           { value: "service", label: "خدمة" },
//                           { value: "product", label: "منتج / صنف" },
//                         ]}
//                       />
//                     </div>

//                     <div
//                       className={
//                         row.item_type === "service"
//                           ? "col-span-12 sm:col-span-8"
//                           : "col-span-12 sm:col-span-5"
//                       }
//                     >
//                       {row.item_type === "service" ? (
//                         <SelectField
//                           label="الخدمة"
//                           name={`service_${idx}`}
//                           value={row.service_id ?? ""}
//                           onChange={(e) => {
//                             const newId = Number(e.target.value);
//                             updateRow(idx, {
//                               service_id: newId,
//                               service_items_ids: [], // نبدأ من الصفر
//                             });
//                           }}
//                           options={services.map((s: Service) => ({
//                             value: s.id,
//                             label: `${s.name}`,
//                           }))}
//                         />
//                       ) : (
//                         <SelectField
//                           label="المنتج"
//                           name={`product_${idx}`}
//                           value={row.product_id ?? ""}
//                           onChange={(e) => updateRow(idx, { product_id: Number(e.target.value) })}
//                           options={products.map((p: Item) => ({
//                             value: p.id,
//                             label: `${p.name} `,
//                           }))}
//                         />
//                       )}
//                     </div>

//                     {row.item_type === "product" && (
//                       <div className="col-span-4 sm:col-span-2">
//                         <TextField
//                           label="الكمية"
//                           name={`qty_${idx}`}
//                           type="number"
//                           min={1}
//                           value={row.quantity}
//                           onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
//                         />

//                       </div>
//                     )}

//                     <div className="col-span-6 sm:col-span-1">
//                       <p className="field-label mb-1.5 truncate">الإجمالي</p>
//                       <p className="py-2.5 text-sm font-extrabold text-primary-600">
//                         {subtotal ? subtotal.toFixed(2) : "0.00"}
//                       </p>
//                     </div>
//                     <div className="col-span-2 sm:col-span-1">
//                       <button
//                         type="button"
//                         onClick={() => removeRow(idx)}
//                         disabled={rows.length === 1}
//                         className="rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10 disabled:opacity-30"
//                         aria-label="حذف الصف"
//                       >
//                         <FiTrash2 size={16} />
//                       </button>
//                     </div>
//                   </div>

//                   {/* ==== Multi select للأصناف المستهلكة ==== */}
//                   {svc && svc.items && svc.items.length > 0 && (
//                     <div className="mt-2.5 rounded-lg bg-mint-100/70 px-3 py-2.5">
//                       <p className="mb-2 flex items-center gap-1 text-xs font-bold text-primary-600">
//                         <FiInfo size={13} /> الأصناف المستهلكة في هذه الخدمة (اختر ما تم استخدامه فعليًا):
//                       </p>
//                       <div className="flex flex-col gap-2">
//                         {svc.items.map((si: any) => {
//                           const selected = (row.service_items_ids ?? []).find(
//                             (x) => x.item_id === si.id
//                           );
//                           const checked = !!selected;

//                           // القيم الافتراضية من الصنف نفسه لو مش متحدد
//                           const displayQty = selected?.quantity ?? si.quantity ?? 0;
//                           const displayPrice = selected?.price ?? si.price ?? 0;
//                           const lineTotal = Number(displayPrice);

//                           return (
//                             <div
//                               key={si.id}
//                               className="flex flex-wrap items-center gap-3 rounded-lg bg-white/60 px-3 py-2"
//                             >
//                               <label className="flex min-w-[140px] items-center gap-1.5 text-xs font-bold text-ink/70">
//                                 <input
//                                   type="checkbox"
//                                   className="accent-primary-600"
//                                   checked={checked}
//                                   onChange={() => toggleServiceItem(idx, si)}
//                                 />
//                                 {si.name}
//                               </label>

//                               {/* البيانات تظهر دايماً */}
//                               <div className="flex items-center gap-1">
//                                 <span className="text-[11px] font-bold text-ink/50">الكميه بالمللي:</span>
//                                 <input
//                                   type="number"
//                                   min={0}
//                                   disabled
//                                   step="0.01"
//                                   className="field-input w-20 !py-1 text-xs"
//                                   value={displayQty}
//                                   readOnly
//                                 />

//                               </div>

//                               <div className="flex items-center gap-1">
//                                 <span className="text-[11px] font-bold text-ink/50">السعر:</span>
//                                 <input
//                                   type="number"
//                                   min={0}
//                                   disabled
//                                   step="0.01"
//                                   className="field-input w-24 !py-1 text-xs"
//                                   value={displayPrice}
//                                   readOnly
//                                 />
//                               </div>

//                               <span className="text-[11px] font-bold text-primary-600">
//                                 الإجمالي: {lineTotal.toFixed(2)} ج.م
//                               </span>

//                               {/* بيانات إضافية للعرض */}
//                               <span className="text-[11px] font-bold text-ink/50">
//                                 المتاح:{" "}
//                                 <span
//                                   className={
//                                     Number(si.current_stock) <= 5
//                                       ? "text-coral-600"
//                                       : "text-ink/70"
//                                   }
//                                 >
//                                   {si.current_stock} {si.stock_unit}
//                                 </span>
//                               </span>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}

//                   {svc && (
//                     <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-primary-700">
//                       <span className="flex items-center gap-1 text-primary-600">
//                         <FiInfo size={13} /> بيانات الخدمة:
//                       </span>
//                       <span>
//                         القسم: <span className="text-ink/70">{svc.department?.name ?? "—"}</span>
//                       </span>
//                       <span>
//                         النوع الطبي:{" "}
//                         <span className="text-ink/70">
//                           {svc.type === "consultation" ? "كشف" : svc.type === "device" ? "جهاز" : "جلسة"}
//                         </span>
//                       </span>
//                       <span>
//                         السعر الأساسي: <span className="text-ink/70">{svc.price} ج.م</span>
//                       </span>
//                     </div>
//                   )}
//                   {prod && (
//                     <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-primary-700">
//                       <span className="flex items-center gap-1 text-primary-600">
//                         <FiInfo size={13} /> بيانات المنتج:
//                       </span>
//                       <span>
//                         النوع: <span className="text-ink/70">{labelOf(ITEM_TYPES, prod.type)}</span>
//                       </span>
//                       <span>
//                         الوحدة: <span className="text-ink/70">{prod.unit}</span>
//                       </span>
//                       <span>
//                         المتاح بالمخزن:{" "}
//                         <span className={Number(prod.current_stock) <= 5 ? "text-coral-600" : "text-ink/70"}>
//                           {prod.current_stock}
//                         </span>
//                       </span>
//                       <span>
//                         سعر البيع: <span className="text-ink/70">{prod.selling_price} ج.م</span>
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="card p-5">
//             <TextareaField
//               label="ملاحظات"
//               name="notes"
//               value={form.notes}
//               onChange={(e) => setForm({ ...form, notes: e.target.value })}
//               placeholder="أي ملاحظات إضافية على الفاتورة..."
//             />
//           </div>
//         </div>

//         {/* ملخص الفاتورة — هنا الفلوس (بعد ما الخدمات اتحددت) */}
//         <div className="xl:col-span-2">
//           <div className="card sticky top-24 flex flex-col gap-4 p-5">
//             <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
//               <FiPackage className="text-primary-500" size={18} />
//               ملخص الفاتورة والدفع
//             </h2>

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <TextField
//                 label="الخصم (ج.م)"
//                 name="discount"
//                 type="number"
//                 min={0}
//                 value={form.discount}
//                 onChange={(e) => setForm({ ...form, discount: e.target.value })}
//               />
//             </div>

//             <label className="flex items-center gap-2 text-sm font-bold text-ink">
//               <input
//                 type="checkbox"
//                 className="h-4 w-4 rounded border-ink/20 text-primary-600"
//                 checked={partialPayment}
//                 onChange={(e) => {
//                   setPartialPayment(e.target.checked);
//                   if (!e.target.checked) setForm((f) => ({ ...f, paid_amount: "" }));
//                 }}
//               />
//               دفع جزئي (مش هيدفع المبلغ بالكامل دلوقتي)
//             </label>

//             {partialPayment && (
//               <TextField
//                 label="المبلغ المدفوع الآن (ج.م)"
//                 name="paid_amount"
//                 type="number"
//                 min={0}
//                 required
//                 value={form.paid_amount}
//                 onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
//                 placeholder={`الإجمالي المطلوب: ${grandTotal.toFixed(2)}`}
//               />
//             )}

//             <div className="flex flex-col gap-2 rounded-xl bg-mint-100/70 p-4 text-sm">
//               <div className="flex items-center justify-between">
//                 <span className="font-bold text-ink/55">عدد الأصناف</span>
//                 <span className="font-bold text-ink">{rows.length}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="font-bold text-ink/55">إجمالي الأصناف</span>
//                 <span className="font-bold text-ink">{itemsTotal.toFixed(2)} ج.م</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="font-bold text-ink/55">الخصم</span>
//                 <span className="font-bold text-coral-600">- {discountValue.toFixed(2)} ج.م</span>
//               </div>
//               <div className="flex items-center justify-between border-t border-ink/10 pt-2">
//                 <span className="font-bold text-ink/70">الإجمالي المطلوب</span>
//                 <span className="font-display text-xl font-extrabold text-primary-600">
//                   {grandTotal.toFixed(2)} ج.م
//                 </span>
//               </div>
//               <div className="flex items-center justify-between border-t border-ink/10 pt-2">
//                 <span className="font-bold text-ink/55">المدفوع</span>
//                 <span className="font-bold text-ink">{paidValue.toFixed(2)} ج.م</span>
//               </div>
//               {remainingValue > 0 && (
//                 <div className="flex items-center justify-between">
//                   <span className="font-bold text-coral-600">المتبقي</span>
//                   <span className="font-bold text-coral-600">{remainingValue.toFixed(2)} ج.م</span>
//                 </div>
//               )}
//             </div>

//             <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
//               {isLoading ? "جاري الحفظ..." : "حفظ الفاتورة"}
//             </button>
//             {onCancel && (
//               <button type="button" onClick={onCancel} className="btn-secondary w-full py-3">
//                 إلغاء
//               </button>
//             )}
//           </div>
//         </div>
//       </form>

//       <PatientFormModal
//         open={patientModalOpen}
//         onClose={() => setPatientModalOpen(false)}
//         patient={null}
//         onCreated={(newPatient) => setForm((f) => ({ ...f, patient_id: String(newPatient.id) }))}
//       />

//       <InvoicePrintModal
//         open={printOpen}
//         onClose={() => setPrintOpen(false)}
//         invoice={createdInvoice}
//       />
//     </>
//   );
// };

// export default InvoiceCreateForm;

import { useMemo, useState } from "react";
import { FiPlus, FiTrash2, FiInfo, FiUser, FiTag, FiPackage } from "react-icons/fi";
import { TextField, TextareaField } from "@/components/shared/FormField";
import SearchableSelect from "@/components/shared/SearchableSelect";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PatientFormModal from "@/components/patients/PatientFormModal";
import { INVOICE_TYPES, PAYMENT_METHODS, ITEM_TYPES, labelOf } from "@/utils/constants";
import type {
  Invoice,
  InvoiceItemInput,
  Item,
  Patient,
  Service,
  Staff,
  PaginatedResponse,
} from "@/types";
import InvoicePrintModal from "./Invoiceprintmodal";

interface SelectedServiceItem {
  item_id: number;
  quantity: number;
  price: number;
}

const emptyRow: any = {
  item_type: "service",
  service_id: null,
  product_id: null,
  quantity: 1,
  service_items_ids: [] as SelectedServiceItem[],
};

const initialForm = {
  patient_id: "",
  type: "consultation" as Invoice["type"],
  payment_method: "cash" as Invoice["payment_method"],
  doctor_id: "",
  nurse_id: "",
  discount: "0",
  paid_amount: "",
  notes: "",
};

interface InvoiceCreateFormProps {
  onSuccess?: (invoice?: Invoice) => void;
  onCancel?: () => void;
}

const InvoiceCreateForm = ({ onSuccess, onCancel }: InvoiceCreateFormProps) => {
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState<InvoiceItemInput[]>([{ ...emptyRow }]);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [partialPayment, setPartialPayment] = useState(false);

  // ===== بحث المرضى =====
  const [patientSearch, setPatientSearch] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [patientOpen, setPatientOpen] = useState(false);

  // ===== شاشة الطباعة بعد الحفظ =====
  const [printOpen, setPrintOpen] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);

  const requiresDoctor = form.type !== "direct_sale";
  const allowsNurse = form.type === "session";

  // ===== المرضى (مع بحث + pagination) =====
  const { data: patientData, isLoading: patientsLoading } = useFetch<
    PaginatedResponse<Patient>
  >({
    queryKey: ["patients", patientPage, patientSearch],
    endpoint: "patients",
    params: {
      page: patientPage,
      ...(patientSearch ? { search: patientSearch } : {}),
    },
    keepPrevious: true,
  });
  const patients =
    patientData?.data ?? (Array.isArray(patientData) ? (patientData as any) : []);

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
  const services =
    serviceData?.data ?? (Array.isArray(serviceData) ? (serviceData as any) : []);

  const { data: itemData } = useFetch<{ data: Item[] }>({
    queryKey: ["items"],
    endpoint: "items?type=retailable",
  });
  const products =
    itemData?.data ?? (Array.isArray(itemData) ? (itemData as any) : []);

  const { mutate, isLoading } = useMutate({
    endpoint: "invoices",
    method: "post",
    mutationKey: ["invoice-save"],
    invalidateKeys: [["invoices"], ["items"]],
    successMessage: "تم إنشاء الفاتورة بنجاح",
    onSuccess: (invoice: any) => {
      const saved = invoice?.data ?? invoice;
      setCreatedInvoice(saved);
      setPrintOpen(true);
      setForm(initialForm);
      setRows([{ ...emptyRow }]);
      setPartialPayment(false);
      setPatientSearch("");
      onSuccess?.(saved);
    },
  });

  const findService = (id?: number | null) => services.find((s: Service) => s.id === id);
  const findProduct = (id?: number | null) => products.find((p: Item) => p.id === id);

  const updateRow = (idx: number, patch: Partial<InvoiceItemInput>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));
  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);

  // ==== Multi select للأصناف المستهلكة ====
  const toggleServiceItem = (idx: number, item: any) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const current: SelectedServiceItem[] = r.service_items_ids ?? [];
        const exists = current.some((x) => x.item_id === item.id);

        return {
          ...r,
          service_items_ids: exists
            ? current.filter((x) => x.item_id !== item.id)
            : [
                ...current,
                {
                  item_id: item.id,
                  quantity: Number(item.quantity ?? 0),
                  price: Number(item.price ?? 0),
                },
              ],
        };
      })
    );
  };

  const updateServiceItemField = (
    idx: number,
    itemId: number,
    field: "quantity" | "price",
    value: number
  ) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx
          ? {
              ...r,
              service_items_ids: (r.service_items_ids ?? []).map((x) =>
                x.item_id === itemId ? { ...x, [field]: value } : x
              ),
            }
          : r
      )
    );
  };

  const rowsWithTotals = useMemo(
    () =>
      rows.map((row) => {
        const svc = row.item_type === "service" ? findService(row.service_id) : null;
        const prod = row.item_type === "product" ? findProduct(row.product_id) : null;
        const unitPrice = svc ? Number(svc.price) : prod ? Number(prod.selling_price) : 0;

        const serviceItemsTotal =
          row.item_type === "service"
            ? (row.service_items_ids ?? []).reduce(
                (sum, x) => sum + 1 * Number(x.price),
                0
              )
            : 0;

        const subtotal = svc
          ? unitPrice + serviceItemsTotal
          : unitPrice * Number(row.quantity || 0);

        return { row, svc, prod, unitPrice, subtotal, serviceItemsTotal };
      }),
    [rows, services, products]
  );

  const itemsTotal = rowsWithTotals.reduce((sum, r) => sum + r.subtotal, 0);
  const discountValue = Number(form.discount) || 0;
  const grandTotal = Math.max(itemsTotal - discountValue, 0);

  const paidValue = partialPayment ? Number(form.paid_amount) || 0 : grandTotal;
  const remainingValue = Math.max(grandTotal - paidValue, 0);

  const selectedPatient = patients.find(
    (p: Patient) => String(p.id) === form.patient_id
  );

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
      ...(partialPayment ? { paid_amount: Number(form.paid_amount) || 0 } : {}),
      notes: form.notes,
      items: rows.map((r) => {
        if (r.item_type === "service") {
          return {
            item_type: "service",
            service_id: Number(r.service_id),
            product_id: null,
            ...(r.service_items_ids && r.service_items_ids.length > 0
              ? {
                  service_items_ids: r.service_items_ids.map((x) => x.item_id),
                }
              : {}),
          };
        }
        return {
          item_type: "product",
          service_id: null,
          product_id: Number(r.product_id),
          quantity: Number(r.quantity),
        };
      }),
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5 xl:col-span-2">
          {/* بيانات أساسية */}
          <div className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiUser className="text-primary-500" size={18} />
              بيانات الفاتورة
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* ==== بحث المرضى ==== */}
              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <label className="field-label">المريض</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    required={!form.patient_id}
                    value={selectedPatient ? selectedPatient.name : patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setPatientPage(1);
                      setPatientOpen(true);
                      if (form.patient_id) setForm((f) => ({ ...f, patient_id: "" }));
                    }}
                    onFocus={() => setPatientOpen(true)}
                    onBlur={() => setTimeout(() => setPatientOpen(false), 150)}
                  />

                  {patientOpen && (
                    <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-ink/10 bg-white shadow-lg">
                      {patientsLoading && patients.length === 0 && (
                        <li className="px-3 py-2 text-xs text-ink/50">جاري التحميل...</li>
                      )}
                      {!patientsLoading && patients.length === 0 && (
                        <li className="px-3 py-2 text-xs text-ink/50">لا توجد نتائج</li>
                      )}
                      {patients.map((p: Patient) => (
                        <li
                          key={p.id}
                          onMouseDown={() => {
                            setForm((f) => ({ ...f, patient_id: String(p.id) }));
                            setPatientSearch("");
                            setPatientOpen(false);
                          }}
                          className="cursor-pointer px-3 py-2 text-sm hover:bg-mint-100"
                        >
                          <span className="font-bold text-ink">{p.name}</span>
                          {/* <span className="ms-2 text-xs text-ink/50" dir="ltr">
                            {p.phone}
                          </span> */}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPatientModalOpen(true)}
                  className="mb-[1px] shrink-0 rounded-lg border border-ink/10 p-2.5 text-primary-600 hover:bg-primary-500/10"
                  aria-label="إضافة مريض جديد"
                  title="إضافة مريض جديد"
                >
                  <FiPlus size={18} />
                </button>
              </div>

              <SearchableSelect
                label="نوع الفاتورة"
                value={form.type}
                onChange={(v) =>
                  setForm({
                    ...form,
                    type: v as Invoice["type"],
                    doctor_id: "",
                    nurse_id: "",
                  })
                }
                options={INVOICE_TYPES}
              />

              <SearchableSelect
                label="طريقة الدفع"
                value={form.payment_method}
                onChange={(v) =>
                  setForm({ ...form, payment_method: v as Invoice["payment_method"] })
                }
                options={PAYMENT_METHODS}
              />

              {requiresDoctor && (
                <SearchableSelect
                  label="الطبيب"
                  value={form.doctor_id}
                  onChange={(v) => setForm({ ...form, doctor_id: String(v) })}
                  options={doctors.map((d: Staff) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                  placeholder="ابحث عن طبيب..."
                  required
                />
              )}

              {allowsNurse && (
                <SearchableSelect
                  label="الممرض/ة (اختياري)"
                  value={form.nurse_id}
                  onChange={(v) => setForm({ ...form, nurse_id: String(v) })}
                  options={nurses.map((n: Staff) => ({
                    value: n.id,
                    label: n.name,
                  }))}
                  placeholder="ابحث عن ممرض/ة..."
                />
              )}
            </div>
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
                      <SearchableSelect
                        label="النوع"
                        value={row.item_type}
                        onChange={(v) =>
                          updateRow(idx, {
                            item_type: v as "service" | "product",
                            service_id: null,
                            product_id: null,
                            service_items_ids: [],
                            quantity: 1,
                          })
                        }
                        options={[
                          { value: "service", label: "خدمة" },
                          { value: "product", label: "منتج / صنف" },
                        ]}
                      />
                    </div>

                    <div
                      className={
                        row.item_type === "service"
                          ? "col-span-12 sm:col-span-8"
                          : "col-span-12 sm:col-span-5"
                      }
                    >
                      {row.item_type === "service" ? (
                        <SearchableSelect
                          label="الخدمة"
                          value={row.service_id ?? ""}
                          onChange={(v) => {
                            updateRow(idx, {
                              service_id: Number(v),
                              service_items_ids: [],
                            });
                          }}
                          options={services.map((s: Service) => ({
                            value: s.id,
                            label: s.name,
                            // sublabel: `${s.price} ج.م`,
                          }))}
                          placeholder="ابحث عن خدمة..."
                        />
                      ) : (
                        <SearchableSelect
                          label="المنتج"
                          value={row.product_id ?? ""}
                          onChange={(v) => updateRow(idx, { product_id: Number(v) })}
                          options={products.map((p: Item) => ({
                            value: p.id,
                            label: p.name,
                            // sublabel: `${p.selling_price} ج.م`,
                          }))}
                          placeholder="ابحث عن منتج..."
                        />
                      )}
                    </div>

                    {row.item_type === "product" && (
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
                    )}

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

                  {/* ==== Multi select للأصناف المستهلكة ==== */}
                  {svc && svc.items && svc.items.length > 0 && (
                    <div className="mt-2.5 rounded-lg bg-mint-100/70 px-3 py-2.5">
                      <p className="mb-2 flex items-center gap-1 text-xs font-bold text-primary-600">
                        <FiInfo size={13} /> الأصناف المستهلكة في هذه الخدمة (اختر ما تم استخدامه فعليًا):
                      </p>
                      <div className="flex flex-col gap-2">
                        {svc.items.map((si: any) => {
                          const selected = (row.service_items_ids ?? []).find(
                            (x) => x.item_id === si.id
                          );
                          const checked = !!selected;

                          const displayQty = selected?.quantity ?? si.quantity ?? 0;
                          const displayPrice = selected?.price ?? si.price ?? 0;
                          const lineTotal = Number(displayPrice);

                          return (
                            <div
                              key={si.id}
                              className="flex flex-wrap items-center gap-3 rounded-lg bg-white/60 px-3 py-2"
                            >
                              <label className="flex min-w-[140px] items-center gap-1.5 text-xs font-bold text-ink/70">
                                <input
                                  type="checkbox"
                                  className="accent-primary-600"
                                  checked={checked}
                                  onChange={() => toggleServiceItem(idx, si)}
                                />
                                {si.name}
                              </label>

                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-bold text-ink/50">الكميه بالمللي:</span>
                                <input
                                  type="number"
                                  min={0}
                                  disabled
                                  step="0.01"
                                  className="field-input w-20 !py-1 text-xs"
                                  value={displayQty}
                                  readOnly
                                />
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-bold text-ink/50">السعر:</span>
                                <input
                                  type="number"
                                  min={0}
                                  disabled
                                  step="0.01"
                                  className="field-input w-24 !py-1 text-xs"
                                  value={displayPrice}
                                  readOnly
                                />
                              </div>

                              <span className="text-[11px] font-bold text-primary-600">
                                الإجمالي: {lineTotal.toFixed(2)} ج.م
                              </span>

                              <span className="text-[11px] font-bold text-ink/50">
                                المتاح:{" "}
                                <span
                                  className={
                                    Number(si.current_stock) <= 5
                                      ? "text-coral-600"
                                      : "text-ink/70"
                                  }
                                >
                                  {si.current_stock} {si.stock_unit}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                          {svc.type === "consultation"
                            ? "كشف"
                            : svc.type === "device"
                            ? "جهاز"
                            : "جلسة"}
                        </span>
                      </span>
                      <span>
                        السعر الأساسي: <span className="text-ink/70">{svc.price} ج.م</span>
                      </span>
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
                        <span
                          className={
                            Number(prod.current_stock) <= 5
                              ? "text-coral-600"
                              : "text-ink/70"
                          }
                        >
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

        {/* ملخص الفاتورة */}
        <div className="xl:col-span-2">
          <div className="card sticky top-24 flex flex-col gap-4 p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiPackage className="text-primary-500" size={18} />
              ملخص الفاتورة والدفع
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="الخصم (ج.م)"
                name="discount"
                type="number"
                min={0}
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-bold text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-ink/20 text-primary-600"
                checked={partialPayment}
                onChange={(e) => {
                  setPartialPayment(e.target.checked);
                  if (!e.target.checked) setForm((f) => ({ ...f, paid_amount: "" }));
                }}
              />
              دفع جزئي (مش هيدفع المبلغ بالكامل دلوقتي)
            </label>

            {partialPayment && (
              <TextField
                label="المبلغ المدفوع الآن (ج.م)"
                name="paid_amount"
                type="number"
                min={0}
                required
                value={form.paid_amount}
                onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                placeholder={`الإجمالي المطلوب: ${grandTotal.toFixed(2)}`}
              />
            )}

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
                <span className="font-bold text-coral-600">
                  - {discountValue.toFixed(2)} ج.م
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-ink/10 pt-2">
                <span className="font-bold text-ink/70">الإجمالي المطلوب</span>
                <span className="font-display text-xl font-extrabold text-primary-600">
                  {grandTotal.toFixed(2)} ج.م
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-ink/10 pt-2">
                <span className="font-bold text-ink/55">المدفوع</span>
                <span className="font-bold text-ink">{paidValue.toFixed(2)} ج.م</span>
              </div>
              {remainingValue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-coral-600">المتبقي</span>
                  <span className="font-bold text-coral-600">
                    {remainingValue.toFixed(2)} ج.م
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading ? "جاري الحفظ..." : "حفظ الفاتورة"}
            </button>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn-secondary w-full py-3">
                إلغاء
              </button>
            )}
          </div>
        </div>
      </form>

      <PatientFormModal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        patient={null}
        onCreated={(newPatient) =>
          setForm((f) => ({ ...f, patient_id: String(newPatient.id) }))
        }
      />

      <InvoicePrintModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        invoice={createdInvoice}
      />
    </>
  );
};

export default InvoiceCreateForm;