// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import { FiPlus, FiTrash2, FiInfo, FiUser, FiTag, FiPackage } from "react-icons/fi";
// import { TextField, TextareaField } from "@/components/shared/FormField";
// import SearchableSelect from "@/components/shared/SearchableSelect";
// import useFetch from "@/hooks/useFetch";
// import useMutate from "@/hooks/useMutate";
// import PatientFormModal from "@/components/patients/PatientFormModal";
// import { PAYMENT_METHODS } from "@/utils/constants";
// import type { Invoice, Patient, Staff, PaginatedResponse } from "@/types";
// import type { ClinicPackage } from "@/types/packages";
// import InvoicePrintModal from "./Invoiceprintmodal";

// /* =====================================================================
//  * ADAPTERS (مطابقة لـ response: GET patients/:id/active-packages)
//  * ===================================================================== */
// const listOf = <T,>(res: any): T[] =>
//   Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

// const pkgName = (ap: any): string => ap?.package_name ?? `باقة #${ap?.id}`;
// const debtOf = (ap: any): number => Number(ap?.remaining_amount ?? 0);
// const balancesOf = (ap: any): any[] => ap?.balances ?? [];

// const balanceLabel = (b: any): string =>
//   b?.display_name ?? b?.service_name ?? b?.product_name ?? b?.custom_name ?? `رصيد #${b?.id}`;
// const balanceRemaining = (b: any): number => Number(b?.remaining_quantity ?? 0);
// const balanceTotal = (b: any): number => Number(b?.total_quantity ?? 0);
// const balanceConsumed = (b: any): number => Number(b?.consumed_quantity ?? 0);

// const UNIT_LABELS: Record<string, string> = {
//   session: "جلسة",
//   pulse: "نبضة",
//   pulses: "نبضة",
//   ml: "مل",
// };
// const unitLabel = (b: any): string => UNIT_LABELS[b?.unit] ?? b?.unit ?? "";

// const pkgPrice = (p: any): number => Number(p?.package_price ?? p?.price ?? 0);
// /* ===================================================================== */

// type Operation = "package_sale" | "package_consumption" | "package_debt_payment";

// const OPERATION_OPTIONS = [
//   { value: "package_sale", label: "شراء باقة / عرض" },
//   { value: "package_consumption", label: "استهلاك جلسة من باقة" },
//   { value: "package_debt_payment", label: "سداد قسط باقة" },
// ];

// // نوع الفاتورة المتبعت للـ API حسب العملية (حسب أمثلة Postman)
// const INVOICE_TYPE_BY_OPERATION: Record<Operation, string> = {
//   package_sale: "package_sale",
//   package_consumption: "session",
//   package_debt_payment: "direct_sale",
// };

// interface Row {
//   package_id: number | null;
//   patient_package_balance_id: number | null;
//   patient_package_id: number | null;
//   quantity: number;
//   price: number; // مبلغ السداد في سداد القسط
// }

// const emptyRow: Row = {
//   package_id: null,
//   patient_package_balance_id: null,
//   patient_package_id: null,
//   quantity: 1,
//   price: 0,
// };

// const initialForm = {
//   patient_id: "",
//   payment_method: "cash" as Invoice["payment_method"],
//   doctor_id: "",
//   nurse_id: "",
//   paid_amount: "",
//   notes: "",
// };

// const InfoStrip = ({ title, children }: { title: string; children: React.ReactNode }) => (
//   <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-primary-700">
//     <span className="flex items-center gap-1 text-primary-600">
//       <FiInfo size={13} /> {title}
//     </span>
//     {children}
//   </div>
// );

// interface Props {
//   onSuccess?: (invoice?: Invoice) => void;
//   onCancel?: () => void;
// }

// const PackageInvoiceForm = ({ onSuccess, onCancel }: Props) => {
//   const [op, setOp] = useState<Operation>("package_sale");
//   const [form, setForm] = useState(initialForm);
//   const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);
//   const [patientModalOpen, setPatientModalOpen] = useState(false);
//   const [partialPayment, setPartialPayment] = useState(false);

//   // ===== بحث المرضى =====
//   const [patientSearch, setPatientSearch] = useState("");
//   const [patientPage, setPatientPage] = useState(1);
//   const [patientOpen, setPatientOpen] = useState(false);

//   // ===== شاشة الطباعة بعد الحفظ =====
//   const [printOpen, setPrintOpen] = useState(false);
//   const [createdInvoice, setCreatedInvoice] = useState<any>(null);

//   const isSale = op === "package_sale";
//   const isConsumption = op === "package_consumption";
//   const isDebt = op === "package_debt_payment";

//   // ===== المرضى =====
//   const { data: patientData, isLoading: patientsLoading } = useFetch<
//     PaginatedResponse<Patient>
//   >({
//     queryKey: ["patients", patientPage, patientSearch],
//     endpoint: "patients",
//     params: {
//       page: patientPage,
//       ...(patientSearch ? { search: patientSearch } : {}),
//     },
//     keepPrevious: true,
//   });
//   const patients =
//     patientData?.data ?? (Array.isArray(patientData) ? (patientData as any) : []);

//   // ===== الطاقم (للاستهلاك فقط) =====
//   const { data: staffData } = useFetch<{ data: Staff[] }>({
//     queryKey: ["staff"],
//     endpoint: "auth/staff",
//     enabled: isConsumption,
//   });
//   const staff = staffData?.data ?? (Array.isArray(staffData) ? (staffData as any) : []);
//   const doctors = staff.filter((s: Staff) => s.type === "doctor");
//   const nurses = staff.filter((s: Staff) => s.type === "nurse");

//   // ===== العروض المتاحة للبيع =====
//   const { data: packagesData } = useFetch<any>({
//     queryKey: ["packages", "all"],
//     endpoint: "packages?per_page=-1",
//   });
//   const packages = listOf<ClinicPackage>(packagesData).filter((p) => p.is_active);

//   // ===== باقات المريض النشطة =====
//   const { data: activePkgsData } = useFetch<any>({
//     queryKey: ["active-packages", form.patient_id],
//     endpoint: `patients/${form.patient_id}/active-packages`,
//     enabled: !!form.patient_id && !isSale,
//   });
//   const activePackages = form.patient_id && !isSale ? listOf<any>(activePkgsData) : [];

//   const balanceOptions = useMemo(
//     () =>
//       activePackages.flatMap((ap) =>
//         balancesOf(ap)
//           .filter((b) => !b.is_exhausted && balanceRemaining(b) > 0)
//           .map((b) => ({
//             value: b.id,
//             label: `${pkgName(ap)} — ${balanceLabel(b)} (متبقي ${balanceRemaining(b)} ${unitLabel(b)})`,
//           }))
//       ),
//     [activePackages]
//   );

//   const debtOptions = useMemo(
//     () =>
//       activePackages
//         .filter((ap) => debtOf(ap) > 0)
//         .map((ap) => ({
//           value: ap.id,
//           label: `${pkgName(ap)} — متبقي ${debtOf(ap).toFixed(2)} ج.م`,
//         })),
//     [activePackages]
//   );

//   const findBalance = (id?: number | null) => {
//     for (const ap of activePackages) {
//       const b = balancesOf(ap).find((x) => x.id === id);
//       if (b) return { ap, b };
//     }
//     return null;
//   };

//   // تغيير المريض يصفّر اختيارات الاستهلاك/السداد (مرتبطة بباقات المريض)
//   useEffect(() => {
//     if (!isSale) setRows([{ ...emptyRow }]);
//   }, [form.patient_id]); // eslint-disable-line react-hooks/exhaustive-deps

//   const changeOperation = (v: Operation) => {
//     setOp(v);
//     setRows([{ ...emptyRow }]);
//     setPartialPayment(false);
//     setForm((f) => ({ ...f, doctor_id: "", nurse_id: "", paid_amount: "" }));
//   };

//   const { mutate, isLoading } = useMutate({
//     endpoint: "invoices",
//     method: "post",
//     mutationKey: ["package-invoice-save"],
//     invalidateKeys: [["invoices"], ["patient-packages"], ["active-packages"]],
//     successMessage: "تم إنشاء الفاتورة بنجاح",
//     onSuccess: (invoice: any) => {
//       const saved = invoice?.data ?? invoice;
//       setCreatedInvoice(saved);
//       setPrintOpen(true);
//       setForm(initialForm);
//       setRows([{ ...emptyRow }]);
//       setPartialPayment(false);
//       setPatientSearch("");
//       onSuccess?.(saved);
//     },
//   });

//   const findPackage = (id?: number | null) => packages.find((p) => p.id === id);

//   const updateRow = (idx: number, patch: Partial<Row>) =>
//     setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
//   const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));
//   const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);

//   const rowsWithTotals = useMemo(
//     () =>
//       rows.map((row) => {
//         const pkg = isSale ? findPackage(row.package_id) : null;
//         const consumption = isConsumption ? findBalance(row.patient_package_balance_id) : null;
//         const debtPkg = isDebt
//           ? activePackages.find((ap) => ap.id === row.patient_package_id)
//           : null;

//         let subtotal = 0;
//         if (isSale) subtotal = pkg ? pkgPrice(pkg) : 0;
//         else if (isDebt) subtotal = Number(row.price) || 0;
//         // الاستهلاك من الرصيد بدون تكلفة → 0

//         return { row, pkg, consumption, debtPkg, subtotal };
//       }),
//     [rows, packages, activePackages, op]
//   );

//   const grandTotal = rowsWithTotals.reduce((sum, r) => sum + r.subtotal, 0);
//   const paidValue = isSale && partialPayment ? Number(form.paid_amount) || 0 : grandTotal;
//   const remainingValue = Math.max(grandTotal - paidValue, 0);

//   const selectedPatient = patients.find((p: Patient) => String(p.id) === form.patient_id);

//   const validateRows = (): boolean => {
//     for (const { row, consumption, debtPkg } of rowsWithTotals) {
//       if (isSale && !row.package_id) {
//         toast.error("اختر العرض لكل صنف");
//         return false;
//       }
//       if (isConsumption) {
//         if (!consumption) {
//           toast.error("اختر رصيد الباقة المراد استهلاكه");
//           return false;
//         }
//         const q = Number(row.quantity);
//         if (!(q > 0) || q > balanceRemaining(consumption.b)) {
//           toast.error("كمية الاستهلاك أكبر من الرصيد المتبقي أو غير صحيحة");
//           return false;
//         }
//       }
//       if (isDebt) {
//         const amount = Number(row.price);
//         if (!debtPkg) {
//           toast.error("اختر الباقة المراد سداد قسطها");
//           return false;
//         }
//         if (!(amount > 0) || amount > debtOf(debtPkg)) {
//           toast.error("مبلغ السداد أكبر من المتبقي أو غير صحيح");
//           return false;
//         }
//       }
//     }
//     return true;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateRows()) return;

//     mutate({
//       patient_id: Number(form.patient_id),
//       appointment_id: null,
//       type: INVOICE_TYPE_BY_OPERATION[op],
//       payment_method: form.payment_method,
//       doctor_id: isConsumption && form.doctor_id ? Number(form.doctor_id) : null,
//       nurse_id: isConsumption && form.nurse_id ? Number(form.nurse_id) : null,
//       discount: 0,
//       paid_amount: paidValue,
//       notes: form.notes,
//       items: rowsWithTotals.map(({ row, pkg }) => {
//         if (isSale) {
//           return {
//             item_type: "package",
//             package_id: Number(row.package_id),
//             quantity: 1,
//             price: pkgPrice(pkg),
//           };
//         }
//         if (isConsumption) {
//           return {
//             item_type: "package_consumption",
//             patient_package_balance_id: Number(row.patient_package_balance_id),
//             quantity: Number(row.quantity),
//             price: 0,
//           };
//         }
//         return {
//           item_type: "package_debt_payment",
//           patient_package_id: Number(row.patient_package_id),
//           amount: Number(row.price),
//         };
//       }),
//     });
//   };

//   return (
//     <>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 xl:grid-cols-2">
//         <div className="flex flex-col gap-5 xl:col-span-2">
//           {/* بيانات أساسية */}
//           <div className="card p-5">
//             <h2 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold text-ink">
//               <FiUser className="text-primary-500" size={18} />
//               بيانات العملية
//             </h2>
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               {/* ==== بحث المرضى ==== */}
//               <div className="flex items-end gap-2">
//                 <div className="relative flex-1">
//                   <label className="field-label">المريض</label>
//                   <input
//                     type="text"
//                     className="field-input"
//                     placeholder="ابحث بالاسم أو رقم الهاتف..."
//                     required={!form.patient_id}
//                     value={selectedPatient ? selectedPatient.name : patientSearch}
//                     onChange={(e) => {
//                       setPatientSearch(e.target.value);
//                       setPatientPage(1);
//                       setPatientOpen(true);
//                       if (form.patient_id) setForm((f) => ({ ...f, patient_id: "" }));
//                     }}
//                     onFocus={() => setPatientOpen(true)}
//                     onBlur={() => setTimeout(() => setPatientOpen(false), 150)}
//                   />

//                   {patientOpen && (
//                     <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-ink/10 bg-white shadow-lg">
//                       {patientsLoading && patients.length === 0 && (
//                         <li className="px-3 py-2 text-xs text-ink/50">جاري التحميل...</li>
//                       )}
//                       {!patientsLoading && patients.length === 0 && (
//                         <li className="px-3 py-2 text-xs text-ink/50">لا توجد نتائج</li>
//                       )}
//                       {patients.map((p: Patient) => (
//                         <li
//                           key={p.id}
//                           onMouseDown={() => {
//                             setForm((f) => ({ ...f, patient_id: String(p.id) }));
//                             setPatientSearch("");
//                             setPatientOpen(false);
//                           }}
//                           className="cursor-pointer px-3 py-2 text-sm hover:bg-mint-100"
//                         >
//                           <span className="font-bold text-ink">{p.name}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
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

//               <SearchableSelect
//                 label="نوع العملية"
//                 value={op}
//                 onChange={(v) => changeOperation(v as Operation)}
//                 options={OPERATION_OPTIONS}
//               />

//               <SearchableSelect
//                 label="طريقة الدفع"
//                 value={form.payment_method}
//                 onChange={(v) =>
//                   setForm({ ...form, payment_method: v as Invoice["payment_method"] })
//                 }
//                 options={PAYMENT_METHODS}
//               />

//               {isConsumption && (
//                 <>
//                   <SearchableSelect
//                     label="الطبيب"
//                     value={form.doctor_id}
//                     onChange={(v) => setForm({ ...form, doctor_id: String(v) })}
//                     options={doctors.map((d: Staff) => ({ value: d.id, label: d.name }))}
//                     placeholder="ابحث عن طبيب..."
//                     required
//                   />
//                   <SearchableSelect
//                     label="الممرض/ة (اختياري)"
//                     value={form.nurse_id}
//                     onChange={(v) => setForm({ ...form, nurse_id: String(v) })}
//                     options={nurses.map((n: Staff) => ({ value: n.id, label: n.name }))}
//                     placeholder="ابحث عن ممرض/ة..."
//                   />
//                 </>
//               )}
//             </div>
//           </div>

//           {/* الأصناف */}
//           <div className="card p-5">
//             <div className="mb-4 flex items-center justify-between">
//               <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
//                 <FiTag className="text-primary-500" size={18} />
//                 {isSale ? "العروض المشتراة" : isConsumption ? "الأرصدة المستهلكة" : "الأقساط المسددة"}
//               </h2>
//               <button type="button" onClick={addRow} className="btn-ghost !px-3 !py-1.5 text-xs">
//                 <FiPlus size={14} /> إضافة بند
//               </button>
//             </div>

//             {!isSale && !form.patient_id && (
//               <p className="mb-3 flex items-center gap-1 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-primary-600">
//                 <FiInfo size={13} /> اختر المريض أولاً لعرض باقاته النشطة.
//               </p>
//             )}
//             {form.patient_id && isConsumption && balanceOptions.length === 0 && (
//               <p className="mb-3 flex items-center gap-1 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-coral-600">
//                 <FiInfo size={13} /> لا توجد أرصدة باقات متاحة لهذا المريض.
//               </p>
//             )}
//             {form.patient_id && isDebt && debtOptions.length === 0 && (
//               <p className="mb-3 flex items-center gap-1 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-coral-600">
//                 <FiInfo size={13} /> لا توجد باقات عليها متبقي لهذا المريض.
//               </p>
//             )}

//             <div className="flex flex-col gap-3">
//               {rowsWithTotals.map(({ row, pkg, consumption, debtPkg, subtotal }, idx) => {
//                 const hasExtra = isConsumption || isDebt;
//                 const isSessionBalance = consumption?.b?.unit === "session";

//                 return (
//                   <div key={idx} className="rounded-xl border border-ink/10 p-3.5">
//                     <div className="grid grid-cols-12 items-end gap-2">
//                       <div
//                         className={
//                           hasExtra
//                             ? "col-span-12 sm:col-span-7"
//                             : "col-span-12 sm:col-span-9"
//                         }
//                       >
//                         {isSale && (
//                           <SearchableSelect
//                             label="العرض / الباقة"
//                             value={row.package_id ?? ""}
//                             onChange={(v) => updateRow(idx, { package_id: Number(v) })}
//                             options={packages.map((p) => ({
//                               value: p.id,
//                               label: `${p.name} — ${pkgPrice(p)} ج.م`,
//                             }))}
//                             placeholder="ابحث عن عرض..."
//                           />
//                         )}

//                         {isConsumption && (
//                           <SearchableSelect
//                             label="رصيد الباقة"
//                             value={row.patient_package_balance_id ?? ""}
//                             onChange={(v) =>
//                               updateRow(idx, {
//                                 patient_package_balance_id: Number(v),
//                                 quantity: 1,
//                               })
//                             }
//                             options={balanceOptions}
//                             placeholder="اختر الرصيد المراد خصمه..."
//                           />
//                         )}

//                         {isDebt && (
//                           <SearchableSelect
//                             label="الباقة المراد سداد قسطها"
//                             value={row.patient_package_id ?? ""}
//                             onChange={(v) =>
//                               updateRow(idx, { patient_package_id: Number(v), price: 0 })
//                             }
//                             options={debtOptions}
//                             placeholder="اختر الباقة..."
//                           />
//                         )}
//                       </div>

//                       {isConsumption && (
//                         <div className="col-span-6 sm:col-span-2">
//                           <TextField
//                             label={`الكمية${consumption ? ` (${unitLabel(consumption.b)})` : ""}`}
//                             name={`qty_${idx}`}
//                             type="number"
//                             min={isSessionBalance ? 1 : 0.01}
//                             step={isSessionBalance ? "1" : "any"}
//                             value={row.quantity}
//                             onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
//                           />
//                         </div>
//                       )}

//                       {isDebt && (
//                         <div className="col-span-6 sm:col-span-2">
//                           <TextField
//                             label="المبلغ (ج.م)"
//                             name={`debt_${idx}`}
//                             type="number"
//                             min={0}
//                             value={row.price || ""}
//                             onChange={(e) => updateRow(idx, { price: Number(e.target.value) })}
//                           />
//                         </div>
//                       )}

//                       <div className="col-span-6 sm:col-span-2">
//                         <p className="field-label mb-1.5 truncate">الإجمالي</p>
//                         <p className="py-2.5 text-sm font-extrabold text-primary-600">
//                           {subtotal ? subtotal.toFixed(2) : "0.00"}
//                         </p>
//                       </div>
//                       <div className="col-span-2 sm:col-span-1">
//                         <button
//                           type="button"
//                           onClick={() => removeRow(idx)}
//                           disabled={rows.length === 1}
//                           className="rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10 disabled:opacity-30"
//                           aria-label="حذف الصف"
//                         >
//                           <FiTrash2 size={16} />
//                         </button>
//                       </div>
//                     </div>

//                     {/* ==== بيانات العرض ==== */}
//                     {pkg && (
//                       <InfoStrip title="بيانات العرض:">
//                         <span>
//                           السعر الأصلي:{" "}
//                           <span className="text-ink/70 line-through">
//                             {Number(pkg.original_price)} ج.م
//                           </span>
//                         </span>
//                         <span>
//                           سعر العرض: <span className="text-ink/70">{pkgPrice(pkg)} ج.م</span>
//                         </span>
//                         <span>
//                           الصلاحية: <span className="text-ink/70">{pkg.validity_days} يوم</span>
//                         </span>
//                         <span>
//                           عدد البنود: <span className="text-ink/70">{pkg.items?.length ?? 0}</span>
//                         </span>
//                       </InfoStrip>
//                     )}

//                     {/* ==== بيانات الرصيد ==== */}
//                     {consumption && (
//                       <InfoStrip title="بيانات الرصيد:">
//                         <span>
//                           الباقة: <span className="text-ink/70">{pkgName(consumption.ap)}</span>
//                         </span>
//                         <span>
//                           الرصيد: <span className="text-ink/70">{balanceLabel(consumption.b)}</span>
//                         </span>
//                         <span>
//                           الإجمالي:{" "}
//                           <span className="text-ink/70">
//                             {balanceTotal(consumption.b)} {unitLabel(consumption.b)}
//                           </span>
//                         </span>
//                         <span>
//                           المستهلك:{" "}
//                           <span className="text-ink/70">{balanceConsumed(consumption.b)}</span>
//                         </span>
//                         <span>
//                           المتبقي:{" "}
//                           <span
//                             className={
//                               balanceRemaining(consumption.b) <= 1
//                                 ? "text-coral-600"
//                                 : "text-ink/70"
//                             }
//                           >
//                             {balanceRemaining(consumption.b)}
//                           </span>
//                         </span>
//                         {consumption.ap?.expires_at && (
//                           <span>
//                             ينتهي في:{" "}
//                             <span className="text-ink/70">{consumption.ap.expires_at}</span>
//                           </span>
//                         )}
//                         <span className="text-primary-600">الجلسة من الرصيد بدون تكلفة (0 ج.م)</span>
//                       </InfoStrip>
//                     )}

//                     {/* ==== بيانات السداد ==== */}
//                     {debtPkg && (
//                       <InfoStrip title="بيانات السداد:">
//                         <span>
//                           إجمالي الباقة:{" "}
//                           <span className="text-ink/70">{Number(debtPkg.total_price)} ج.م</span>
//                         </span>
//                         <span>
//                           المدفوع:{" "}
//                           <span className="text-ink/70">{Number(debtPkg.paid_amount)} ج.م</span>
//                         </span>
//                         <span>
//                           المتبقي:{" "}
//                           <span className="text-coral-600">{debtOf(debtPkg).toFixed(2)} ج.م</span>
//                         </span>
//                         <button
//                           type="button"
//                           className="text-primary-600 underline"
//                           onClick={() => updateRow(idx, { price: debtOf(debtPkg) })}
//                         >
//                           سداد المتبقي بالكامل
//                         </button>
//                       </InfoStrip>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="card p-5">
//             <TextareaField
//               label="ملاحظات"
//               name="notes"
//               value={form.notes}
//               onChange={(e) => setForm({ ...form, notes: e.target.value })}
//               placeholder="أي ملاحظات إضافية..."
//             />
//           </div>
//         </div>

//         {/* ملخص */}
//         <div className="xl:col-span-2">
//           <div className="card sticky top-24 flex flex-col gap-4 p-5">
//             <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
//               <FiPackage className="text-primary-500" size={18} />
//               ملخص العملية والدفع
//             </h2>

//             {isSale && (
//               <label className="flex items-center gap-2 text-sm font-bold text-ink">
//                 <input
//                   type="checkbox"
//                   className="h-4 w-4 rounded border-ink/20 text-primary-600"
//                   checked={partialPayment}
//                   onChange={(e) => {
//                     setPartialPayment(e.target.checked);
//                     if (!e.target.checked) setForm((f) => ({ ...f, paid_amount: "" }));
//                   }}
//                 />
//                 دفع مقدم (الباقي يتسدد على أقساط)
//               </label>
//             )}

//             {isSale && partialPayment && (
//               <TextField
//                 label="المبلغ المدفوع الآن (ج.م)"
//                 name="paid_amount"
//                 type="number"
//                 min={0}
//                 required
//                 value={form.paid_amount}
//                 onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
//                 placeholder={`إجمالي الباقة: ${grandTotal.toFixed(2)}`}
//               />
//             )}

//             <div className="flex flex-col gap-2 rounded-xl bg-mint-100/70 p-4 text-sm">
//               <div className="flex items-center justify-between">
//                 <span className="font-bold text-ink/55">عدد البنود</span>
//                 <span className="font-bold text-ink">{rows.length}</span>
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
//               {isLoading ? "جاري الحفظ..." : "حفظ"}
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
//         onCreated={(newPatient) =>
//           setForm((f) => ({ ...f, patient_id: String(newPatient.id) }))
//         }
//       />

//       <InvoicePrintModal
//         open={printOpen}
//         onClose={() => setPrintOpen(false)}
//         invoice={createdInvoice}
//       />
//     </>
//   );
// };

// export default PackageInvoiceForm;

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiInfo, FiUser, FiTag, FiPackage } from "react-icons/fi";
import { TextField, TextareaField } from "@/components/shared/FormField";
import SearchableSelect from "@/components/shared/SearchableSelect";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PatientFormModal from "@/components/patients/PatientFormModal";
import { PAYMENT_METHODS } from "@/utils/constants";
import type { Invoice, Patient, Staff, PaginatedResponse } from "@/types";
import type { ClinicPackage } from "@/types/packages";

/* =====================================================================
 * ADAPTERS (مطابقة لـ response: GET patients/:id/active-packages)
 * ===================================================================== */
const listOf = <T,>(res: any): T[] =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const pkgName = (ap: any): string => ap?.package_name ?? `باقة #${ap?.id}`;
const debtOf = (ap: any): number => Number(ap?.remaining_amount ?? 0);
const balancesOf = (ap: any): any[] => ap?.balances ?? [];

const balanceLabel = (b: any): string =>
  b?.display_name ?? b?.service_name ?? b?.product_name ?? b?.custom_name ?? `رصيد #${b?.id}`;
const balanceRemaining = (b: any): number => Number(b?.remaining_quantity ?? 0);
const balanceTotal = (b: any): number => Number(b?.total_quantity ?? 0);
const balanceConsumed = (b: any): number => Number(b?.consumed_quantity ?? 0);

const UNIT_LABELS: Record<string, string> = {
  session: "جلسة",
  pulse: "نبضة",
  pulses: "نبضة",
  ml: "مل",
};
const unitLabel = (b: any): string => UNIT_LABELS[b?.unit] ?? b?.unit ?? "";

const pkgPrice = (p: any): number => Number(p?.package_price ?? p?.price ?? 0);
/* ===================================================================== */

type Operation = "package_sale" | "package_consumption" | "package_debt_payment";

const OPERATION_OPTIONS = [
  { value: "package_sale", label: "شراء باقة / عرض" },
  { value: "package_consumption", label: "استهلاك جلسة من باقة" },
  { value: "package_debt_payment", label: "سداد قسط باقة" },
];

interface Row {
  package_id: number | null;
  patient_package_balance_id: number | null;
  patient_package_id: number | null;
  quantity: number;
  price: number; // مبلغ السداد في سداد القسط
}

const emptyRow: Row = {
  package_id: null,
  patient_package_balance_id: null,
  patient_package_id: null,
  quantity: 1,
  price: 0,
};

const initialForm = {
  patient_id: "",
  payment_method: "cash" as Invoice["payment_method"],
  doctor_id: "",
  nurse_id: "",
  paid_amount: "",
  notes: "",
};

const InfoStrip = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-primary-700">
    <span className="flex items-center gap-1 text-primary-600">
      <FiInfo size={13} /> {title}
    </span>
    {children}
  </div>
);

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PackageInvoiceForm = ({ onSuccess, onCancel }: Props) => {
  const [op, setOp] = useState<Operation>("package_sale");
  const [form, setForm] = useState(initialForm);
  const [row, setRow] = useState<Row>({ ...emptyRow });
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [partialPayment, setPartialPayment] = useState(false);

  // ===== بحث المرضى =====
  const [patientSearch, setPatientSearch] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [patientOpen, setPatientOpen] = useState(false);

  const isSale = op === "package_sale";
  const isConsumption = op === "package_consumption";
  const isDebt = op === "package_debt_payment";

  // ===== المرضى =====
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

  // ===== الطاقم (للاستهلاك فقط) =====
  const { data: staffData } = useFetch<{ data: Staff[] }>({
    queryKey: ["staff"],
    endpoint: "auth/staff",
    enabled: isConsumption,
  });
  const staff = staffData?.data ?? (Array.isArray(staffData) ? (staffData as any) : []);
  const doctors = staff.filter((s: Staff) => s.type === "doctor");
  const nurses = staff.filter((s: Staff) => s.type === "nurse");

  // ===== العروض المتاحة للبيع =====
  const { data: packagesData } = useFetch<any>({
    queryKey: ["packages", "all"],
    endpoint: "packages?per_page=-1",
  });
  const packages = listOf<ClinicPackage>(packagesData).filter((p) => p.is_active);

  // ===== باقات المريض النشطة =====
  const { data: activePkgsData } = useFetch<any>({
    queryKey: ["active-packages", form.patient_id],
    endpoint: `patients/${form.patient_id}/active-packages`,
    enabled: !!form.patient_id && !isSale,
  });
  const activePackages: any[] =
    form.patient_id && !isSale ? listOf<any>(activePkgsData) : [];

  const balanceOptions = activePackages.flatMap((ap) =>
    balancesOf(ap)
      .filter((b) => !b.is_exhausted && balanceRemaining(b) > 0)
      .map((b) => ({
        value: b.id,
        label: `${pkgName(ap)} — ${balanceLabel(b)} (متبقي ${balanceRemaining(b)} ${unitLabel(b)})`,
      }))
  );

  const debtOptions = activePackages
    .filter((ap) => debtOf(ap) > 0)
    .map((ap) => ({
      value: ap.id,
      label: `${pkgName(ap)} — متبقي ${debtOf(ap).toFixed(2)} ج.م`,
    }));

  const findBalance = (id?: number | null) => {
    for (const ap of activePackages) {
      const b = balancesOf(ap).find((x) => x.id === id);
      if (b) return { ap, b };
    }
    return null;
  };

  // تغيير المريض يصفّر اختيارات الاستهلاك/السداد (مرتبطة بباقات المريض)
  useEffect(() => {
    if (!isSale) setRow({ ...emptyRow });
  }, [form.patient_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeOperation = (v: Operation) => {
    setOp(v);
    setRow({ ...emptyRow });
    setPartialPayment(false);
    setForm((f) => ({ ...f, doctor_id: "", nurse_id: "", paid_amount: "" }));
  };

  const resetAll = () => {
    setForm(initialForm);
    setRow({ ...emptyRow });
    setPartialPayment(false);
    setPatientSearch("");
    onSuccess?.();
  };

  const invalidateKeys = [["patients"], ["patient-packages"], ["active-packages"]];

  // ===== 1) شراء باقة =====
  const { mutate: subscribe, isLoading: subscribing } = useMutate({
    endpoint: "patient-packages/subscribe",
    method: "post",
    mutationKey: ["patient-package-subscribe"],
    invalidateKeys,
    successMessage: "تم شراء الباقة بنجاح",
    onSuccess: resetAll,
  });

  // ===== 2) استهلاك من الباقة =====
  const { mutate: consume, isLoading: consuming } = useMutate({
    endpoint: "patient-packages/consume",
    method: "post",
    mutationKey: ["patient-package-consume"],
    invalidateKeys,
    successMessage: "تم تسجيل الاستهلاك بنجاح",
    onSuccess: resetAll,
  });

  // ===== 3) سداد قسط =====
  const { mutate: payDebt, isLoading: payingDebt } = useMutate({
    endpoint: `patient-packages/${row.patient_package_id}/pay-debt`,
    method: "post",
    mutationKey: ["patient-package-pay-debt"],
    invalidateKeys,
    successMessage: "تم سداد القسط بنجاح",
    onSuccess: resetAll,
  });

  const isLoading = subscribing || consuming || payingDebt;

  // ===== الحسابات =====
  const pkg = isSale ? packages.find((p) => p.id === row.package_id) : null;
  const consumption = isConsumption ? findBalance(row.patient_package_balance_id) : null;
  const debtPkg = isDebt
    ? activePackages.find((ap) => ap.id === row.patient_package_id)
    : null;

  let subtotal = 0;
  if (isSale) subtotal = pkg ? pkgPrice(pkg) : 0;
  else if (isDebt) subtotal = Number(row.price) || 0;
  // الاستهلاك من الرصيد بدون تكلفة → 0

  const grandTotal = subtotal;
  const paidValue = isSale && partialPayment ? Number(form.paid_amount) || 0 : grandTotal;
  const remainingValue = Math.max(grandTotal - paidValue, 0);

  const selectedPatient = patients.find((p: Patient) => String(p.id) === form.patient_id);

  const validate = (): boolean => {
    if (!form.patient_id) {
      toast.error("اختر المريض");
      return false;
    }
    if (isSale) {
      if (!row.package_id) {
        toast.error("اختر العرض");
        return false;
      }
      if (partialPayment && (paidValue < 0 || paidValue > grandTotal)) {
        toast.error("المبلغ المدفوع غير صحيح");
        return false;
      }
    }
    if (isConsumption) {
      if (!consumption) {
        toast.error("اختر رصيد الباقة المراد استهلاكه");
        return false;
      }
      if (!form.doctor_id) {
        toast.error("اختر الطبيب");
        return false;
      }
      const q = Number(row.quantity);
      if (!(q > 0) || q > balanceRemaining(consumption.b)) {
        toast.error("كمية الاستهلاك أكبر من الرصيد المتبقي أو غير صحيحة");
        return false;
      }
    }
    if (isDebt) {
      const amount = Number(row.price);
      if (!debtPkg) {
        toast.error("اختر الباقة المراد سداد قسطها");
        return false;
      }
      if (!(amount > 0) || amount > debtOf(debtPkg)) {
        toast.error("مبلغ السداد أكبر من المتبقي أو غير صحيح");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isSale) {
      subscribe({
        patient_id: Number(form.patient_id),
        package_id: Number(row.package_id),
        paid_amount: paidValue,
        payment_method: form.payment_method,
        notes: form.notes,
      });
      return;
    }

    if (isConsumption) {
      consume({
        patient_package_balance_id: Number(row.patient_package_balance_id),
        quantity: Number(row.quantity),
        doctor_id: Number(form.doctor_id),
        nurse_id: form.nurse_id ? Number(form.nurse_id) : null,
        notes: form.notes,
      });
      return;
    }

    payDebt({
      amount: Number(row.price),
      payment_method: form.payment_method,
      notes: form.notes,
    });
  };

  const isSessionBalance = consumption?.b?.unit === "session";
  const hasExtra = isConsumption || isDebt;

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5 xl:col-span-2">
          {/* بيانات أساسية */}
          <div className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiUser className="text-primary-500" size={18} />
              بيانات العملية
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
                label="نوع العملية"
                value={op}
                onChange={(v) => changeOperation(v as Operation)}
                options={OPERATION_OPTIONS}
              />

              {!isConsumption && (
                <SearchableSelect
                  label="طريقة الدفع"
                  value={form.payment_method}
                  onChange={(v) =>
                    setForm({ ...form, payment_method: v as Invoice["payment_method"] })
                  }
                  options={PAYMENT_METHODS}
                />
              )}

              {isConsumption && (
                <>
                  <SearchableSelect
                    label="الطبيب"
                    value={form.doctor_id}
                    onChange={(v) => setForm({ ...form, doctor_id: String(v) })}
                    options={doctors.map((d: Staff) => ({ value: d.id, label: d.name }))}
                    placeholder="ابحث عن طبيب..."
                    required
                  />
                  <SearchableSelect
                    label="الممرض/ة (اختياري)"
                    value={form.nurse_id}
                    onChange={(v) => setForm({ ...form, nurse_id: String(v) })}
                    options={nurses.map((n: Staff) => ({ value: n.id, label: n.name }))}
                    placeholder="ابحث عن ممرض/ة..."
                  />
                </>
              )}
            </div>
          </div>

          {/* الصنف */}
          <div className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiTag className="text-primary-500" size={18} />
              {isSale ? "العرض المشترى" : isConsumption ? "الرصيد المستهلك" : "القسط المسدد"}
            </h2>

            {!isSale && !form.patient_id && (
              <p className="mb-3 flex items-center gap-1 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-primary-600">
                <FiInfo size={13} /> اختر المريض أولاً لعرض باقاته النشطة.
              </p>
            )}
            {form.patient_id && isConsumption && balanceOptions.length === 0 && (
              <p className="mb-3 flex items-center gap-1 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-coral-600">
                <FiInfo size={13} /> لا توجد أرصدة باقات متاحة لهذا المريض.
              </p>
            )}
            {form.patient_id && isDebt && debtOptions.length === 0 && (
              <p className="mb-3 flex items-center gap-1 rounded-lg bg-mint-100/70 px-3 py-2 text-xs font-bold text-coral-600">
                <FiInfo size={13} /> لا توجد باقات عليها متبقي لهذا المريض.
              </p>
            )}

            <div className="rounded-xl border border-ink/10 p-3.5">
              <div className="grid grid-cols-12 items-end gap-2">
                <div
                  className={
                    hasExtra ? "col-span-12 sm:col-span-7" : "col-span-12 sm:col-span-10"
                  }
                >
                  {isSale && (
                    <SearchableSelect
                      label="العرض / الباقة"
                      value={row.package_id ?? ""}
                      onChange={(v) => setRow({ ...row, package_id: Number(v) })}
                      options={packages.map((p) => ({
                        value: p.id,
                        label: `${p.name} — ${pkgPrice(p)} ج.م`,
                      }))}
                      placeholder="ابحث عن عرض..."
                    />
                  )}

                  {isConsumption && (
                    <SearchableSelect
                      label="رصيد الباقة"
                      value={row.patient_package_balance_id ?? ""}
                      onChange={(v) =>
                        setRow({
                          ...row,
                          patient_package_balance_id: Number(v),
                          quantity: 1,
                        })
                      }
                      options={balanceOptions}
                      placeholder="اختر الرصيد المراد خصمه..."
                    />
                  )}

                  {isDebt && (
                    <SearchableSelect
                      label="الباقة المراد سداد قسطها"
                      value={row.patient_package_id ?? ""}
                      onChange={(v) =>
                        setRow({ ...row, patient_package_id: Number(v), price: 0 })
                      }
                      options={debtOptions}
                      placeholder="اختر الباقة..."
                    />
                  )}
                </div>

                {isConsumption && (
                  <div className="col-span-6 sm:col-span-3">
                    <TextField
                      label={`الكمية${consumption ? ` (${unitLabel(consumption.b)})` : ""}`}
                      name="qty"
                      type="number"
                      min={isSessionBalance ? 1 : 0.01}
                      step={isSessionBalance ? "1" : "any"}
                      value={row.quantity}
                      onChange={(e) => setRow({ ...row, quantity: Number(e.target.value) })}
                    />
                  </div>
                )}

                {isDebt && (
                  <div className="col-span-6 sm:col-span-3">
                    <TextField
                      label="المبلغ (ج.م)"
                      name="debt"
                      type="number"
                      min={0}
                      value={row.price || ""}
                      onChange={(e) => setRow({ ...row, price: Number(e.target.value) })}
                    />
                  </div>
                )}

                <div className="col-span-6 sm:col-span-2">
                  <p className="field-label mb-1.5 truncate">الإجمالي</p>
                  <p className="py-2.5 text-sm font-extrabold text-primary-600">
                    {subtotal ? subtotal.toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>

              {/* ==== بيانات العرض ==== */}
              {pkg && (
                <InfoStrip title="بيانات العرض:">
                  <span>
                    السعر الأصلي:{" "}
                    <span className="text-ink/70 line-through">
                      {Number(pkg.original_price)} ج.م
                    </span>
                  </span>
                  <span>
                    سعر العرض: <span className="text-ink/70">{pkgPrice(pkg)} ج.م</span>
                  </span>
                  <span>
                    الصلاحية: <span className="text-ink/70">{pkg.validity_days} يوم</span>
                  </span>
                  <span>
                    عدد البنود: <span className="text-ink/70">{pkg.items?.length ?? 0}</span>
                  </span>
                </InfoStrip>
              )}

              {/* ==== بيانات الرصيد ==== */}
              {consumption && (
                <InfoStrip title="بيانات الرصيد:">
                  <span>
                    الباقة: <span className="text-ink/70">{pkgName(consumption.ap)}</span>
                  </span>
                  <span>
                    الرصيد: <span className="text-ink/70">{balanceLabel(consumption.b)}</span>
                  </span>
                  <span>
                    الإجمالي:{" "}
                    <span className="text-ink/70">
                      {balanceTotal(consumption.b)} {unitLabel(consumption.b)}
                    </span>
                  </span>
                  <span>
                    المستهلك:{" "}
                    <span className="text-ink/70">{balanceConsumed(consumption.b)}</span>
                  </span>
                  <span>
                    المتبقي:{" "}
                    <span
                      className={
                        balanceRemaining(consumption.b) <= 1 ? "text-coral-600" : "text-ink/70"
                      }
                    >
                      {balanceRemaining(consumption.b)}
                    </span>
                  </span>
                  {consumption.ap?.expires_at && (
                    <span>
                      ينتهي في: <span className="text-ink/70">{consumption.ap.expires_at}</span>
                    </span>
                  )}
                  <span className="text-primary-600">الجلسة من الرصيد بدون تكلفة (0 ج.م)</span>
                </InfoStrip>
              )}

              {/* ==== بيانات السداد ==== */}
              {debtPkg && (
                <InfoStrip title="بيانات السداد:">
                  <span>
                    إجمالي الباقة:{" "}
                    <span className="text-ink/70">{Number(debtPkg.total_price)} ج.م</span>
                  </span>
                  <span>
                    المدفوع:{" "}
                    <span className="text-ink/70">{Number(debtPkg.paid_amount)} ج.م</span>
                  </span>
                  <span>
                    المتبقي:{" "}
                    <span className="text-coral-600">{debtOf(debtPkg).toFixed(2)} ج.م</span>
                  </span>
                  <button
                    type="button"
                    className="text-primary-600 underline"
                    onClick={() => setRow({ ...row, price: debtOf(debtPkg) })}
                  >
                    سداد المتبقي بالكامل
                  </button>
                </InfoStrip>
              )}
            </div>
          </div>

          <div className="card p-5">
            <TextareaField
              label="ملاحظات"
              name="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>

        {/* ملخص */}
        <div className="xl:col-span-2">
          <div className="card sticky top-24 flex flex-col gap-4 p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiPackage className="text-primary-500" size={18} />
              ملخص العملية والدفع
            </h2>

            {isSale && (
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
                دفع مقدم (الباقي يتسدد على أقساط)
              </label>
            )}

            {isSale && partialPayment && (
              <TextField
                label="المبلغ المدفوع الآن (ج.م)"
                name="paid_amount"
                type="number"
                min={0}
                required
                value={form.paid_amount}
                onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                placeholder={`إجمالي الباقة: ${grandTotal.toFixed(2)}`}
              />
            )}

            <div className="flex flex-col gap-2 rounded-xl bg-mint-100/70 p-4 text-sm">
              <div className="flex items-center justify-between border-b border-ink/10 pb-2">
                <span className="font-bold text-ink/70">الإجمالي المطلوب</span>
                <span className="font-display text-xl font-extrabold text-primary-600">
                  {grandTotal.toFixed(2)} ج.م
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink/55">المدفوع</span>
                <span className="font-bold text-ink">{paidValue.toFixed(2)} ج.م</span>
              </div>
              {remainingValue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-coral-600">المتبقي</span>
                  <span className="font-bold text-coral-600">{remainingValue.toFixed(2)} ج.م</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading ? "جاري الحفظ..." : "حفظ"}
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
    </>
  );
};

export default PackageInvoiceForm;