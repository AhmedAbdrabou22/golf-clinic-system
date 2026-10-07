

// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { FiPlus, FiTrash2, FiLock, FiCheckCircle, FiArrowRight } from "react-icons/fi";
// import PageHeader from "@/components/shared/PageHeader";
// import { TextField, SelectField, CheckboxField, TextareaField } from "@/components/shared/FormField";
// import useFetch from "@/hooks/useFetch";
// import useMutate from "@/hooks/useMutate";
// import {
//   STAFF_TYPES,
//   CONTRACT_TYPES,
//   DOCTOR_COMMISSION_MODES,
//   SERVICE_COMMISSION_TYPES,
//   CONTRACT_TARGET_TYPES,
// } from "@/utils/constants";
// import type { Department, Role, Staff } from "@/types";
// import type {
//   Contract,
//   ContractType,
//   DepartmentCommission,
//   ServiceCommission,
//   ServiceCommissionType,
// } from "@/utils/contractPayroll";
// import SearchableSelect from "../shared/SearchableSelect";

// type TabKey = "staff" | "contract";
// type DoctorMode = "" | "fixed_per_service" | "flat_percentage" | "target_escalation";

// const initialStaffForm = {
//   name: "",
//   phone: "",
//   email: "",
//   password: "",
//   role_id: "",
//   type: "receptionist",
//   basic_salary: "",
//   is_active: true,
//   department_id: "",
//   achieved_target: false,
// };

// const emptyContractForm = {
//   title: "",
//   contract_type: "" as ContractType | "",
//   is_active: true,
//   notes: "",
//   hourly_rate: "",
//   overtime_hour_rate: "",
//   late_deduction_rate_per_hour: "",
//   applies_department_commission: false,
//   device_session_commission: "",
//   medication_commission_type: "percentage" as "fixed" | "percentage",
//   // ✅ قيمة عمولة الأدوية — الـ key بيتبعت مختلف حسب النوع
//   medication_commission_value: "",
//   medication_commission_percentage: "",
//   holiday_day_rate: "",
//   default_service_commission_type: "" as ServiceCommissionType | "",
//   default_service_commission_value: "",
//   // ⚠️ قديمة — اتشالت من الفورم، سايبها هنا بس لو احتجنا نقراها من الباك
//   laser_service_commission_percentage: "",
//   other_service_commission_percentage: "",
//   has_target: false,
//   target_amount: "",
//   target_type: "doctor_income",
//   target_achieved_hourly_rate: "",
//   target_achieved_laser_percentage: "",
//   target_achieved_other_percentage: "",
//   target_bonus: "",
// };

// const detectDoctorMode = (contract: Contract | null): DoctorMode => {
//   if (!contract) return "";

//   const hasServices = (contract.service_commissions?.length ?? 0) > 0;

//   // ✅ لو فيه تارجت → النمط الجديد "نسب + تارجت وتصعيد"
//   if (contract.has_target || contract.target_amount) {
//     return "target_escalation";
//   }

//   // لو فيه خدمات بس من غير تارجت → نمط "سعر ثابت لكل خدمة"
//   if (hasServices) return "fixed_per_service";

//   // غير كده → نسبة ثابتة
//   return "flat_percentage";
// };

// const emptyDeptRow = (): DepartmentCommission & { _key: number } => ({
//   _key: Math.random(),
//   department_id: 0,
//   percentage: 0,
// });

// const emptyServiceRow = (): ServiceCommission & { _key: number } => ({
//   _key: Math.random(),
//   service_id: 0,
//   commission_type: "percentage",
//   commission_value: 0,
//   // ✅ جديد — للنمط "نسب + تارجت وتصعيد"
//   doctor_service_price: 0,
//   is_laser: false,
// });

// const StaffContractFormPage = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();

//   // ===== staffId يتحكم في وضع الصفحة كلها =====
//   const [staffId, setStaffId] = useState<number | null>(id ? Number(id) : null);
//   const isEditStaff = !!id;
//   const contractUnlocked = !!staffId;

//   const [tab, setTab] = useState<TabKey>("staff");
//   const [staffSaved, setStaffSaved] = useState(false);

//   const [form, setForm] = useState(initialStaffForm);
//   const [contractForm, setContractForm] = useState(emptyContractForm);
//   const [doctorMode, setDoctorMode] = useState<DoctorMode>("");
//   const [deptRows, setDeptRows] = useState<(DepartmentCommission & { _key: number })[]>([]);
//   const [serviceRows, setServiceRows] = useState<(ServiceCommission & { _key: number })[]>([]);
//   const [existingContract, setExistingContract] = useState<Contract | null>(null);

//   // ===== جلب بيانات الموظف نفسه (وضع التعديل فقط) =====
//   const { data: staffResp } = useFetch<any>({
//     queryKey: ["staff-detail", id],
//     endpoint: `auth/staff/${id}`,
//     enabled: isEditStaff,
//   });
//   const staff: Staff | null = staffResp?.data ?? (staffResp?.id ? staffResp : null);

//   const doctorDepartmentId = staff?.department_id ?? null;


//   useEffect(() => {
//     setForm(
//       staff
//         ? {
//             name: staff.name,
//             phone: staff.phone,
//             email: staff.email ?? "",
//             password: "",
//             role_id: String(staff.role_id ?? ""),
//             type: staff.type,
//             basic_salary: staff.basic_salary != null ? String(staff.basic_salary) : "",
//             is_active: staff.is_active,
//             department_id: staff.department_id != null ? String(staff.department_id) : "",
//             achieved_target: !!(staff as any).achieved_target,
//           }
//         : initialStaffForm
//     );
//   }, [staff]);

//   // ===== قوائم مساعدة =====
//   const { data: roleData } = useFetch<{ data: Role[] }>({ queryKey: ["roles"], endpoint: "auth/roles" });
//   const roles = roleData?.data ?? (Array.isArray(roleData) ? (roleData as any) : []);

//   const { data: deptData } = useFetch<{ data: Department[] }>({
//     queryKey: ["departments"],
//     endpoint: "departments",
//   });
//   const departments = deptData?.data ?? (Array.isArray(deptData) ? (deptData as any) : []);

//   // ===== جلب العقد الحالي لنفس الموظف =====
//   const { data: contractData } = useFetch<any>({
//     queryKey: ["staff-contract", staffId],
//     endpoint: "contracts",
//     params: { user_id: staffId, per_page: 100 },
//     enabled: contractUnlocked,
//   });

//   useEffect(() => {
//     if (!staffId) return;
//     if (!contractData) {
//       setExistingContract(null);
//       return;
//     }

//     const list: any[] = Array.isArray(contractData?.data)
//       ? contractData.data
//       : Array.isArray(contractData)
//       ? contractData
//       : contractData?.data?.id
//       ? [contractData.data]
//       : contractData?.id
//       ? [contractData]
//       : [];

//     const raw = list.find((c: any) => Number(c.user_id) === Number(staffId)) ?? null;
//     const found: Contract | null = raw?.id ? raw : null;
//     setExistingContract(found);

//     if (!found) {
//       setContractForm(emptyContractForm);
//       setDoctorMode("");
//       setDeptRows([]);
//       setServiceRows([]);
//       return;
//     }

//     setContractForm({
//       title: found.title ?? "",
//       contract_type: found.contract_type ?? "",
//       medication_commission_type: (found as any).medication_commission_type ?? "percentage",
//       is_active: found.is_active ?? true,
//       notes: found.notes ?? "",
//       hourly_rate: found.hourly_rate != null ? String(found.hourly_rate) : "",
//       overtime_hour_rate: found.overtime_hour_rate != null ? String(found.overtime_hour_rate) : "",
//       late_deduction_rate_per_hour:
//         found.late_deduction_rate_per_hour != null ? String(found.late_deduction_rate_per_hour) : "",
//       applies_department_commission: found.applies_department_commission ?? false,
//       device_session_commission:
//         found.device_session_commission != null ? String(found.device_session_commission) : "",
//       // ✅ نقرا القيمة من الـ key المناسب حسب النوع
//       medication_commission_value:
//         (found as any).medication_commission_value != null
//           ? String((found as any).medication_commission_value)
//           : "",
//       medication_commission_percentage:
//         (found as any).medication_commission_percentage != null
//           ? String((found as any).medication_commission_percentage)
//           : (found as any).medication_sales_percentage != null
//           ? String((found as any).medication_sales_percentage)
//           : "",
//       holiday_day_rate: found.holiday_day_rate != null ? String(found.holiday_day_rate) : "",
//       default_service_commission_type: found.default_service_commission_type ?? "percentage",
//       default_service_commission_value:
//         found.default_service_commission_value != null ? String(found.default_service_commission_value) : "",
//       // ⚠️ قديمة — مش بتستخدم في النمط الجديد بس بنقراها لو موجودة
//       laser_service_commission_percentage:
//         found.laser_service_commission_percentage != null
//           ? String(found.laser_service_commission_percentage)
//           : "",
//       other_service_commission_percentage:
//         found.other_service_commission_percentage != null
//           ? String(found.other_service_commission_percentage)
//           : "",
//       has_target: found.has_target ?? false,
//       target_amount: found.target_amount != null ? String(found.target_amount) : "",
//       target_type: found.target_type ?? "doctor_income",
//       target_achieved_hourly_rate:
//         found.target_achieved_hourly_rate != null ? String(found.target_achieved_hourly_rate) : "",
//       target_achieved_laser_percentage:
//         found.target_achieved_laser_percentage != null ? String(found.target_achieved_laser_percentage) : "",
//       target_achieved_other_percentage:
//         found.target_achieved_other_percentage != null ? String(found.target_achieved_other_percentage) : "",
//       target_bonus: found.target_bonus != null ? String(found.target_bonus) : "",
//     });
//     setDoctorMode(detectDoctorMode(found));
//     setDeptRows(found.department_commissions?.map((d) => ({ ...d, _key: Math.random() })) ?? []);
//     setServiceRows(
//       found.service_commissions?.map((s) => ({
//         _key: Math.random(),
//         service_id: s.service_id,
//         commission_type: s.commission_type,
//         commission_value: s.commission_value,
//         doctor_service_price: (s as any).doctor_service_price ?? 0,
//         is_laser: (s as any).is_laser ?? false,
//       })) ?? []
//     );
//   }, [contractData, staffId]);

//   const contractType = contractForm.contract_type;

//   // const { data: servicesData } = useFetch<any>({
//   //   queryKey: ["services-list"],
//   //   endpoint: "services?per_page=-1",
//   //   enabled:
//   //     tab === "contract" &&
//   //     contractType === "doctor" &&
//   //     (doctorMode === "fixed_per_service" || doctorMode === "target_escalation"),
//   // });
//   const { data: servicesData } = useFetch<any>({
//   queryKey: ["services-list", doctorDepartmentId],
//   endpoint: "services",
//   params: {
//     per_page: -1,
//     ...(doctorDepartmentId ? { department_id: doctorDepartmentId } : {}),
//   },
//   enabled:
//     tab === "contract" &&
//     contractType === "doctor" &&
//     !!doctorDepartmentId &&
//     (doctorMode === "fixed_per_service" || doctorMode === "target_escalation"),
// });
//   const servicesList: any[] = servicesData?.data ?? (Array.isArray(servicesData) ? servicesData : []);
//   const serviceOptions = useMemo(
//     () => servicesList.map((s) => ({ value: String(s.id), label: s.name ?? s.title ?? `خدمة #${s.id}` })),
//     [servicesList]
//   );

//   // ===== حفظ الموظف =====
//   const { mutate: saveStaff, isLoading: savingStaff } = useMutate({
//     endpoint: isEditStaff ? `auth/staff/${id}` : "auth/staff",
//     method: isEditStaff ? "put" : "post",
//     mutationKey: ["staff-save"],
//     invalidateKeys: [["staff"]],
//     successMessage: isEditStaff
//       ? "تم تعديل بيانات الموظف بنجاح"
//       : "تم إضافة الموظف بنجاح، تقدر تضيف له عقد دلوقتي",
//     onSuccess: (res: any) => {
//       const newId = res?.data?.id ?? res?.id ?? staffId;
//       setStaffId(newId);
//       setStaffSaved(true);
//       setTab("contract");
//       if (!isEditStaff) navigate(`/staff/${newId}/edit`, { replace: true });
//     },
//   });

//   const handleStaffSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const payload: Record<string, any> = {
//       name: form.name,
//       phone: form.phone,
//       email: form.email,
//       role_id: Number(form.role_id),
//       type: form.type,
//       basic_salary: Number(form.basic_salary) || 0,
//       is_active: form.is_active,
//       department_id: form.department_id ? Number(form.department_id) : null,
//       achieved_target: form.achieved_target ? 1 : 0,
//     };
//     if (!isEditStaff || form.password) payload.password = form.password;
//     saveStaff(payload);
//   };

//   // ===== حفظ العقد =====
//   const isEditContract = !!existingContract;
//   const { mutate: saveContract, isLoading: savingContract } = useMutate({
//     endpoint: isEditContract ? `contracts/${existingContract?.id}` : "contracts",
//     method: isEditContract ? "put" : "post",
//     mutationKey: ["contract-save"],
//     invalidateKeys: [["contracts"], ["staff-contract", staffId]],
//     successMessage: isEditContract ? "تم تعديل العقد بنجاح" : "تم إضافة العقد بنجاح",
//     onSuccess: () => navigate("/staff"),
//   });

//   const num = (v: string) => (v === "" ? undefined : Number(v));

//   const handleContractSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!staffId) return;

//     // ✅ validation: لازم يختار نوع عمولة الأدوية
//     if (contractType === "nurse" && !contractForm.medication_commission_type) {
//       alert("لازم تختار نوع عمولة الأدوية الأول");
//       return;
//     }

//     // ✅ validation: النمط الجديد لازم فيه خدمة واحدة على الأقل
//     if (
//       contractType === "doctor" &&
//       doctorMode === "target_escalation" &&
//       serviceRows.length === 0
//     ) {
//       alert("لازم تضيف خدمة واحدة على الأقل في نمط نسب + تارجت وتصعيد");
//       return;
//     }

//     const base: Record<string, any> = {
//       user_id: staffId,
//       title: contractForm.title,
//       contract_type: contractForm.contract_type,
//       is_active: contractForm.is_active,
//       notes: contractForm.notes || null,
//     };

//     if (contractType === "receptionist") {
//       Object.assign(base, {
//         hourly_rate: num(contractForm.hourly_rate) ?? 0,
//         overtime_hour_rate: num(contractForm.overtime_hour_rate),
//         late_deduction_rate_per_hour: num(contractForm.late_deduction_rate_per_hour),
//         applies_department_commission: contractForm.applies_department_commission,
//         department_commissions: contractForm.applies_department_commission
//           ? deptRows.map(({ department_id, percentage }) => ({
//               department_id: Number(department_id),
//               percentage: Number(percentage),
//             }))
//           : [],
//       });
//     }

//     if (contractType === "nurse") {
//       const medicationPayload: Record<string, any> = {
//         device_session_commission: num(contractForm.device_session_commission),
//         medication_commission_type: contractForm.medication_commission_type,
//         holiday_day_rate: num(contractForm.holiday_day_rate),
//         overtime_hour_rate: num(contractForm.overtime_hour_rate),
//         late_deduction_rate_per_hour: num(contractForm.late_deduction_rate_per_hour),
//       };

//       // ✅ الـ key بيتبعت حسب نوع العمولة المختار
//       if (contractForm.medication_commission_type === "fixed") {
//         medicationPayload.medication_commission_value = num(contractForm.medication_commission_value);
//       } else {
//         medicationPayload.medication_commission_percentage = num(
//           contractForm.medication_commission_percentage
//         );
//       }

//       Object.assign(base, medicationPayload);
//     }

//     if (contractType === "doctor") {
//       if (doctorMode === "fixed_per_service") {
//         Object.assign(base, {
//           service_commissions: serviceRows.map(
//             ({ service_id, commission_type, commission_value }) => ({
//               service_id: Number(service_id),
//               commission_type,
//               commission_value: Number(commission_value),
//             })
//           ),
//         });
//       } else if (doctorMode === "flat_percentage") {
//         Object.assign(base, {
//           default_service_commission_type: contractForm.default_service_commission_type,
//           default_service_commission_value: num(contractForm.default_service_commission_value),
//         });
//       } else if (doctorMode === "target_escalation") {
//         Object.assign(base, {
//           hourly_rate: num(contractForm.hourly_rate),
//           has_target: contractForm.has_target,
//           target_amount: num(contractForm.target_amount),
//           target_type: "doctor_income", // ✅ ثابت — مخفي في الفورم
//           target_achieved_hourly_rate: num(contractForm.target_achieved_hourly_rate),
//           target_achieved_laser_percentage: num(contractForm.target_achieved_laser_percentage),
//           target_achieved_other_percentage: num(contractForm.target_achieved_other_percentage),
//           target_bonus: num(contractForm.target_bonus) ?? 0,

//           // ✅ الخدمات بسعر محاسبة الطبيب و is_laser
//           service_commissions: serviceRows.map(
//             ({ service_id, doctor_service_price, is_laser, commission_type, commission_value }) => ({
//               service_id: Number(service_id),
//               doctor_service_price: Number(doctor_service_price) || 0,
//               is_laser: !!is_laser,
//               commission_type,
//               commission_value: Number(commission_value) || 0,
//             })
//           ),
//         });
//       }
//     }

//     saveContract(base);
//   };

//   const pageTitle = isEditStaff ? "تعديل بيانات الموظف والعقد" : "إضافة موظف جديد";

//   return (
//     <div>
//       <PageHeader
//         title={pageTitle}
//         // subtitle="بيانات الموظف والعقد كل واحد له API منفصل"
//         action={
//           <button className="btn-secondary" onClick={() => navigate("/staff")}>
//             <FiArrowRight size={16} /> رجوع للقائمة
//           </button>
//         }
//       />

//       <div className="card p-6">
//         {/* ===== أزرار التبويبات ===== */}
//         <div className="mb-4 flex gap-2 border-b border-ink/10">
//           <button
//             type="button"
//             onClick={() => setTab("staff")}
//             className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-bold transition ${
//               tab === "staff" ? "border-primary-600 text-primary-600" : "border-transparent text-ink/50"
//             }`}
//           >
//             بيانات الموظف
//             {staffSaved && <FiCheckCircle size={14} className="text-primary-600" />}
//           </button>
//           <button
//             type="button"
//             disabled={!contractUnlocked}
//             onClick={() => contractUnlocked && setTab("contract")}
//             className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-bold transition ${
//               tab === "contract" ? "border-primary-600 text-primary-600" : "border-transparent text-ink/50"
//             } ${!contractUnlocked ? "cursor-not-allowed opacity-40" : ""}`}
//             title={!contractUnlocked ? "احفظ بيانات الموظف أولاً" : undefined}
//           >
//             {!contractUnlocked && <FiLock size={12} />}
//             العقد <span className="font-normal text-ink/40">(اختياري)</span>
//           </button>
//         </div>

//         {/* ===== تبويب: بيانات الموظف ===== */}
//         {tab === "staff" && (
//           <form onSubmit={handleStaffSubmit} className="flex flex-col gap-4">
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <TextField
//                 label="الاسم"
//                 name="name"
//                 required
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//               />
//               <TextField
//                 label="رقم الهاتف"
//                 name="phone"
//                 dir="ltr"
//                 required
//                 value={form.phone}
//                 onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               />
//               <TextField
//                 label="البريد الإلكتروني"
//                 name="email"
//                 type="email"
//                 dir="ltr"
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value })}
//               />
//               <TextField
//                 label={isEditStaff ? "كلمة المرور (اتركها فارغة لعدم التغيير)" : "كلمة المرور"}
//                 name="password"
//                 type="password"
//                 required={!isEditStaff}
//                 value={form.password}
//                 onChange={(e) => setForm({ ...form, password: e.target.value })}
//               />
//               <SelectField
//                 label="الوظيفة"
//                 name="type"
//                 required
//                 value={form.type}
//                 onChange={(e) => setForm({ ...form, type: e.target.value })}
//                 options={STAFF_TYPES}
//               />
//               <SelectField
//                 label="الدور"
//                 name="role_id"
//                 required
//                 value={form.role_id}
//                 onChange={(e) => setForm({ ...form, role_id: e.target.value })}
//                 options={roles.map((r: Role) => ({ value: r.id, label: r.name }))}
//               />
//               <SelectField
//                 label="القسم"
//                 name="department_id"
//                 value={form.department_id}
//                 onChange={(e) => setForm({ ...form, department_id: e.target.value })}
//                 options={departments.map((d: Department) => ({ value: d.id, label: d.name }))}
//               />
//               <TextField
//                 label="الراتب الأساسي (ج.م)"
//                 name="basic_salary"
//                 type="number"
//                 min={0}
//                 value={form.basic_salary}
//                 onChange={(e) => setForm({ ...form, basic_salary: e.target.value })}
//               />
//             </div>
//             <div className="flex flex-col gap-2">
//               <CheckboxField
//                 label="الموظف نشط"
//                 name="is_active"
//                 checked={form.is_active}
//                 onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
//               />
//               <CheckboxField
//                 label="حقق التارجت؟"
//                 name="achieved_target"
//                 checked={form.achieved_target}
//                 onChange={(e) => setForm({ ...form, achieved_target: e.target.checked })}
//               />
//             </div>
//             <div className="mt-2 flex gap-3">
//               <button type="button" onClick={() => navigate("/staff")} className="btn-secondary flex-1">
//                 إلغاء
//               </button>
//               <button type="submit" disabled={savingStaff} className="btn-primary flex-1">
//                 {savingStaff ? "جاري الحفظ..." : staffSaved ? "حفظ والمتابعة للعقد" : "حفظ ومتابعة"}
//               </button>
//             </div>
//           </form>
//         )}

//         {/* ===== تبويب: العقد ===== */}
//         {tab === "contract" && contractUnlocked && (
//           <form onSubmit={handleContractSubmit} className="flex flex-col gap-4">
//             <p className="rounded-lg bg-paper px-3 py-2 text-xs text-ink/50">
//               العقد اختياري، لو مش عايز تضيف عقد دلوقتي اضغط "تخطي والرجوع".
//             </p>

//             <div className="grid grid-cols-2 gap-4">
//               <SelectField
//                 label="نوع العقد"
//                 name="contract_type"
//                 required
//                 value={contractForm.contract_type}
//                 onChange={(e) =>
//                   setContractForm({ ...contractForm, contract_type: e.target.value as ContractType })
//                 }
//                 options={CONTRACT_TYPES}
//                 placeholder="اختر نوع العقد"
//               />
//               <TextField
//                 label="عنوان العقد"
//                 name="title"
//                 required
//                 value={contractForm.title}
//                 onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
//                 placeholder="مثال: عقد موظف استقبال"
//               />
//             </div>

//             <label className="flex items-center gap-2 text-sm font-bold text-ink">
//               <input
//                 type="checkbox"
//                 className="h-4 w-4 rounded border-ink/20 text-primary-600"
//                 checked={contractForm.is_active}
//                 onChange={(e) => setContractForm({ ...contractForm, is_active: e.target.checked })}
//               />
//               العقد فعال
//             </label>

//             {contractType === "receptionist" && (
//               <div className="flex flex-col gap-4 rounded-xl border border-ink/10 p-4">
//                 <div className="grid grid-cols-3 gap-4">
//                   <TextField
//                     label="سعر الساعة الإضافية"
//                     name="overtime_hour_rate"
//                     type="number"
//                     step="0.01"
//                     value={contractForm.overtime_hour_rate}
//                     onChange={(e) => setContractForm({ ...contractForm, overtime_hour_rate: e.target.value })}
//                   />
//                   <TextField
//                     label="خصم ساعة التأخير"
//                     name="late_deduction_rate_per_hour"
//                     type="number"
//                     step="0.01"
//                     value={contractForm.late_deduction_rate_per_hour}
//                     onChange={(e) =>
//                       setContractForm({ ...contractForm, late_deduction_rate_per_hour: e.target.value })
//                     }
//                   />
//                   <TextField
//                     label="hourly_rate (افتراضي 0)"
//                     name="hourly_rate"
//                     type="number"
//                     step="0.01"
//                     value={contractForm.hourly_rate}
//                     onChange={(e) => setContractForm({ ...contractForm, hourly_rate: e.target.value })}
//                   />
//                 </div>

//                 <label className="flex items-center gap-2 text-sm font-bold text-ink">
//                   <input
//                     type="checkbox"
//                     className="h-4 w-4 rounded border-ink/20 text-primary-600"
//                     checked={contractForm.applies_department_commission}
//                     onChange={(e) =>
//                       setContractForm({ ...contractForm, applies_department_commission: e.target.checked })
//                     }
//                   />
//                   تطبيق نسبة عمولة من مبيعات أقسام معينة
//                 </label>

//                 {contractForm.applies_department_commission && (
//                   <div className="flex flex-col gap-2">
//                     {deptRows.map((row, idx) => (
//                       <div key={row._key} className="flex items-end gap-2">
//                         <div className="flex-1">
//                           <SelectField
//                             label="القسم"
//                             name={`dept_${idx}`}
//                             value={String(row.department_id || "")}
//                             onChange={(e) => {
//                               const next = [...deptRows];
//                               next[idx] = { ...row, department_id: Number(e.target.value) };
//                               setDeptRows(next);
//                             }}
//                             options={departments.map((d: Department) => ({ value: d.id, label: d.name }))}
//                             placeholder="اختر القسم"
//                           />
//                         </div>
//                         <div className="w-32">
//                           <TextField
//                             label="النسبة "
//                             name={`dept_pct_${idx}`}
//                             type="number"
//                             step="0.01"
//                             value={String(row.percentage || "")}
//                             onChange={(e) => {
//                               const next = [...deptRows];
//                               next[idx] = { ...row, percentage: Number(e.target.value) };
//                               setDeptRows(next);
//                             }}
//                           />
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => setDeptRows(deptRows.filter((_, i) => i !== idx))}
//                           className="mb-1 rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10"
//                         >
//                           <FiTrash2 size={16} />
//                         </button>
//                       </div>
//                     ))}
//                     <button
//                       type="button"
//                       onClick={() => setDeptRows([...deptRows, emptyDeptRow()])}
//                       className="btn-secondary self-start"
//                     >
//                       <FiPlus size={15} /> إضافة قسم
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {contractType === "nurse" && (
//               <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink/10 p-4">
//                 <TextField
//                   label="عمولة جلسة الجهاز (ج.م)"
//                   name="device_session_commission"
//                   type="number"
//                   step="0.01"
//                   value={contractForm.device_session_commission}
//                   onChange={(e) =>
//                     setContractForm({ ...contractForm, device_session_commission: e.target.value })
//                   }
//                 />

//                 {/* ✅ نوع عمولة الأدوية */}
//                 <SelectField
//                   label="نوع عمولة الأدوية"
//                   name="medication_commission_type"
//                   required
//                   value={contractForm.medication_commission_type}
//                   onChange={(e) =>
//                     setContractForm({
//                       ...contractForm,
//                       medication_commission_type: e.target.value as "fixed" | "percentage",
//                     })
//                   }
//                   options={[
//                     { value: "percentage", label: "نسبة مئوية (%)" },
//                     { value: "fixed", label: "مبلغ ثابت (ج.م)" },
//                   ]}
//                   placeholder="اختر نوع العمولة"
//                 />

//                 {/* ✅ القيمة — الـ key والليبل بيتغيروا حسب النوع */}
//                 {contractForm.medication_commission_type === "fixed" ? (
//                   <TextField
//                     label="قيمة عمولة الأدوية (ج.م)"
//                     name="medication_commission_value"
//                     type="number"
//                     step="0.01"
//                     value={contractForm.medication_commission_value}
//                     onChange={(e) =>
//                       setContractForm({ ...contractForm, medication_commission_value: e.target.value })
//                     }
//                   />
//                 ) : (
//                   <TextField
//                     label="نسبة مبيعات الأدوية (%)"
//                     name="medication_commission_percentage"
//                     type="number"
//                     step="0.01"
//                     value={contractForm.medication_commission_percentage}
//                     onChange={(e) =>
//                       setContractForm({
//                         ...contractForm,
//                         medication_commission_percentage: e.target.value,
//                       })
//                     }
//                   />
//                 )}

//                 <TextField
//                   label="بدل يوم الإجازة (ج.م)"
//                   name="holiday_day_rate"
//                   type="number"
//                   step="0.01"
//                   value={contractForm.holiday_day_rate}
//                   onChange={(e) => setContractForm({ ...contractForm, holiday_day_rate: e.target.value })}
//                 />
//                 <TextField
//                   label="سعر الساعة الإضافية"
//                   name="overtime_hour_rate"
//                   type="number"
//                   step="0.01"
//                   value={contractForm.overtime_hour_rate}
//                   onChange={(e) => setContractForm({ ...contractForm, overtime_hour_rate: e.target.value })}
//                 />
//                 <TextField
//                   label="خصم ساعة التأخير"
//                   name="late_deduction_rate_per_hour"
//                   type="number"
//                   step="0.01"
//                   value={contractForm.late_deduction_rate_per_hour}
//                   onChange={(e) =>
//                     setContractForm({ ...contractForm, late_deduction_rate_per_hour: e.target.value })
//                   }
//                 />
//               </div>
//             )}

//             {contractType === "doctor" && (
//               <div className="flex flex-col gap-4 rounded-xl border border-ink/10 p-4">
//                 <SelectField
//                   label="نمط احتساب عمولة الطبيب"
//                   name="doctor_mode"
//                   required
//                   value={doctorMode}
//                   onChange={(e) => setDoctorMode(e.target.value as DoctorMode)}
//                   options={DOCTOR_COMMISSION_MODES.map((m) => ({ value: m.value, label: m.label }))}
//                   placeholder="اختر طريقة احتساب العمولة"
//                 />
//                 {doctorMode && (
//                   <p className="-mt-2 text-xs text-ink/50">
//                     {DOCTOR_COMMISSION_MODES.find((m) => m.value === doctorMode)?.hint}
//                   </p>
//                 )}

//                 {doctorMode === "fixed_per_service" && (
//                   <div className="flex flex-col gap-2">
//                     {serviceRows.map((row, idx) => (
//                       <div key={row._key} className="flex items-end gap-2">
//                         <div className="flex-1">
//                           <SearchableSelect
//                             label="الخدمة"
//                             value={row.service_id || null}
//                             onChange={(val) => {
//                               const next = [...serviceRows];
//                               next[idx] = { ...row, service_id: Number(val) };
//                               setServiceRows(next);
//                             }}
//                             options={serviceOptions}
//                             placeholder="ابحث عن خدمة..."
//                           />
//                         </div>
//                         <div className="w-36">
//                           <SelectField
//                             label="نوع العمولة"
//                             name={`service_type_${idx}`}
//                             value={row.commission_type}
//                             onChange={(e) => {
//                               const next = [...serviceRows];
//                               next[idx] = { ...row, commission_type: e.target.value as ServiceCommissionType };
//                               setServiceRows(next);
//                             }}
//                             options={SERVICE_COMMISSION_TYPES}
//                           />
//                         </div>
//                         <div className="w-28">
//                           <TextField
//                             label="القيمة"
//                             name={`service_value_${idx}`}
//                             type="number"
//                             step="0.01"
//                             value={String(row.commission_value || "")}
//                             onChange={(e) => {
//                               const next = [...serviceRows];
//                               next[idx] = { ...row, commission_value: Number(e.target.value) };
//                               setServiceRows(next);
//                             }}
//                           />
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => setServiceRows(serviceRows.filter((_, i) => i !== idx))}
//                           className="mb-1 rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10"
//                         >
//                           <FiTrash2 size={16} />
//                         </button>
//                       </div>
//                     ))}
//                     <button
//                       type="button"
//                       onClick={() => setServiceRows([...serviceRows, emptyServiceRow()])}
//                       className="btn-secondary self-start"
//                     >
//                       <FiPlus size={15} /> إضافة خدمة
//                     </button>
//                   </div>
//                 )}

//                 {doctorMode === "flat_percentage" && (
//                   <div className="grid grid-cols-2 gap-4">
//                     <SelectField
//                       label="نوع العمولة الافتراضية"
//                       name="default_service_commission_type"
//                       required
//                       value={contractForm.default_service_commission_type}
//                       onChange={(e) =>
//                         setContractForm({
//                           ...contractForm,
//                           default_service_commission_type: e.target.value as ServiceCommissionType,
//                         })
//                       }
//                       options={SERVICE_COMMISSION_TYPES}
//                       placeholder="اختر نوع العمولة"
//                     />
//                     <TextField
//                       label="القيمة"
//                       name="default_service_commission_value"
//                       type="number"
//                       step="0.01"
//                       value={contractForm.default_service_commission_value}
//                       onChange={(e) =>
//                         setContractForm({ ...contractForm, default_service_commission_value: e.target.value })
//                       }
//                     />
//                   </div>
//                 )}

//                 {doctorMode === "target_escalation" && (
//                   <>
//                     {/* سعر الساعة */}
//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                       <TextField
//                         label="سعر الساعة (ج.م)"
//                         name="hourly_rate"
//                         type="number"
//                         step="0.01"
//                         value={contractForm.hourly_rate}
//                         onChange={(e) =>
//                           setContractForm({ ...contractForm, hourly_rate: e.target.value })
//                         }
//                       />
//                     </div>

//                     {/* ✅ الخدمات المشمولة — سعر محاسبة + is_laser + نسبة */}
//                     <div className="flex flex-col gap-2 rounded-xl border border-ink/10 p-4">
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm font-bold text-ink">الخدمات المشمولة بالعمولة</p>
//                         <p className="text-xs text-ink/40">
//                           سعر المحاسبة = السعر اللي الطبيب بيتحاسب عليه (مش سعر الفاتورة)
//                         </p>
//                       </div>

//                       {serviceRows.length === 0 && (
//                         <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
//                           لازم تضيف خدمة واحدة على الأقل.
//                         </p>
//                       )}

//                       {serviceRows.map((row, idx) => (
//                         <div
//                           key={row._key}
//                           className="flex flex-wrap items-end gap-2 rounded-lg border border-ink/10 p-2"
//                         >
//                           <div className="min-w-[180px] flex-1">
//                             <SearchableSelect
//                               label="الخدمة"
//                               value={row.service_id || null}
//                               onChange={(val) => {
//                                 const next = [...serviceRows];
//                                 next[idx] = { ...row, service_id: Number(val) };
//                                 setServiceRows(next);
//                               }}
//                               options={serviceOptions}
//                               placeholder="ابحث عن خدمة..."
//                             />
//                           </div>

//                           <div className="w-32">
//                             <TextField
//                               label="سعر محاسبة الطبيب"
//                               name={`service_price_${idx}`}
//                               type="number"
//                               step="0.01"
//                               value={String(row.doctor_service_price ?? "")}
//                               onChange={(e) => {
//                                 const next = [...serviceRows];
//                                 next[idx] = {
//                                   ...row,
//                                   doctor_service_price: Number(e.target.value),
//                                 };
//                                 setServiceRows(next);
//                               }}
//                             />
//                           </div>

//                           <div className="flex w-20 flex-col items-center pb-2">
//                             <label className="mb-1 text-[11px] text-ink/50">ليزر؟</label>
//                             <input
//                               type="checkbox"
//                               className="h-4 w-4 rounded border-ink/20 text-primary-600"
//                               checked={!!row.is_laser}
//                               onChange={(e) => {
//                                 const next = [...serviceRows];
//                                 next[idx] = { ...row, is_laser: e.target.checked };
//                                 setServiceRows(next);
//                               }}
//                             />
//                           </div>

//                           <div className="w-32">
//                             <SelectField
//                               label="نوع العمولة"
//                               name={`service_type_${idx}`}
//                               value={row.commission_type}
//                               onChange={(e) => {
//                                 const next = [...serviceRows];
//                                 next[idx] = {
//                                   ...row,
//                                   commission_type: e.target.value as ServiceCommissionType,
//                                 };
//                                 setServiceRows(next);
//                               }}
//                               options={SERVICE_COMMISSION_TYPES}
//                             />
//                           </div>

//                           <div className="w-24">
//                             <TextField
//                               label="القيمة"
//                               name={`service_value_${idx}`}
//                               type="number"
//                               step="0.01"
//                               value={String(row.commission_value || "")}
//                               onChange={(e) => {
//                                 const next = [...serviceRows];
//                                 next[idx] = {
//                                   ...row,
//                                   commission_value: Number(e.target.value),
//                                 };
//                                 setServiceRows(next);
//                               }}
//                             />
//                           </div>

//                           <button
//                             type="button"
//                             onClick={() =>
//                               setServiceRows(serviceRows.filter((_, i) => i !== idx))
//                             }
//                             className="mb-1 rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10"
//                           >
//                             <FiTrash2 size={16} />
//                           </button>
//                         </div>
//                       ))}

//                       <button
//                         type="button"
//                         onClick={() => setServiceRows([...serviceRows, emptyServiceRow()])}
//                         className="btn-secondary self-start"
//                       >
//                         <FiPlus size={15} /> إضافة خدمة
//                       </button>
//                     </div>

//                     {/* التارجت والتصعيد */}
//                     <label className="flex items-center gap-2 text-sm font-bold text-ink">
//                       <input
//                         type="checkbox"
//                         className="h-4 w-4 rounded border-ink/20 text-primary-600"
//                         checked={contractForm.has_target}
//                         onChange={(e) =>
//                           setContractForm({ ...contractForm, has_target: e.target.checked })
//                         }
//                       />
//                       تفعيل نظام التارجت والتصعيد
//                     </label>

//                     {contractForm.has_target && (
//                       <div className="grid grid-cols-2 gap-4 rounded-xl bg-paper p-4">
//                         <TextField
//                           label="قيمة التارجت (ج.م)"
//                           name="target_amount"
//                           type="number"
//                           step="0.01"
//                           value={contractForm.target_amount}
//                           onChange={(e) =>
//                             setContractForm({ ...contractForm, target_amount: e.target.value })
//                           }
//                         />

//                         {/* ✅ target_type اتشال من الفورم — بيتبعت ثابت doctor_income */}

//                         <TextField
//                           label="سعر الساعة بعد التارجت"
//                           name="target_achieved_hourly_rate"
//                           type="number"
//                           step="0.01"
//                           value={contractForm.target_achieved_hourly_rate}
//                           onChange={(e) =>
//                             setContractForm({
//                               ...contractForm,
//                               target_achieved_hourly_rate: e.target.value,
//                             })
//                           }
//                         />
//                         <TextField
//                           label="نسبة الليزر بعد التارجت (%)"
//                           name="target_achieved_laser_percentage"
//                           type="number"
//                           step="0.01"
//                           value={contractForm.target_achieved_laser_percentage}
//                           onChange={(e) =>
//                             setContractForm({
//                               ...contractForm,
//                               target_achieved_laser_percentage: e.target.value,
//                             })
//                           }
//                         />
//                         <TextField
//                           label="نسبة باقي الخدمات بعد التارجت (%)"
//                           name="target_achieved_other_percentage"
//                           type="number"
//                           step="0.01"
//                           value={contractForm.target_achieved_other_percentage}
//                           onChange={(e) =>
//                             setContractForm({
//                               ...contractForm,
//                               target_achieved_other_percentage: e.target.value,
//                             })
//                           }
//                         />
//                         <TextField
//                           label="بونص تحقيق التارجت (ج.م)"
//                           name="target_bonus"
//                           type="number"
//                           step="0.01"
//                           value={contractForm.target_bonus}
//                           onChange={(e) =>
//                             setContractForm({ ...contractForm, target_bonus: e.target.value })
//                           }
//                         />
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             )}

//             <TextareaField
//               label="ملاحظات"
//               name="notes"
//               value={contractForm.notes}
//               onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
//               placeholder="اختياري"
//             />

//             <div className="mt-2 flex gap-3">
//               <button type="button" onClick={() => navigate("/staff")} className="btn-secondary flex-1">
//                 تخطي والرجوع
//               </button>
//               <button type="submit" disabled={savingContract || !contractType} className="btn-primary flex-1">
//                 {savingContract ? "جاري الحفظ..." : isEditContract ? "حفظ تعديل العقد" : "حفظ العقد"}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StaffContractFormPage;



import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiTrash2, FiLock, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import PageHeader from "@/components/shared/PageHeader";
import { TextField, SelectField, CheckboxField, TextareaField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import {
  STAFF_TYPES,
  CONTRACT_TYPES,
  DOCTOR_COMMISSION_MODES,
  SERVICE_COMMISSION_TYPES,
  CONTRACT_TARGET_TYPES,
} from "@/utils/constants";
import type { Department, Role, Staff } from "@/types";
import type {
  Contract,
  ContractType,
  DepartmentCommission,
  ServiceCommission,
  ServiceCommissionType,
} from "@/utils/contractPayroll";
import SearchableSelect from "../shared/SearchableSelect";

type TabKey = "staff" | "contract";
type DoctorMode = "" | "fixed_per_service" | "flat_percentage" | "target_escalation";

const initialStaffForm = {
  name: "",
  phone: "",
  email: "",
  password: "",
  role_id: "",
  type: "receptionist",
  basic_salary: "",
  is_active: true,
  department_id: "",
  achieved_target: false,
};

const emptyContractForm = {
  title: "",
  contract_type: "" as ContractType | "",
  is_active: true,
  notes: "",
  hourly_rate: "",
  overtime_hour_rate: "",
  late_deduction_rate_per_hour: "",
  applies_department_commission: false,
  device_session_commission: "",
  medication_commission_type: "percentage" as "fixed" | "percentage",
  // ✅ قيمة عمولة الأدوية — الـ key بيتبعت مختلف حسب النوع
  medication_commission_value: "",
  medication_commission_percentage: "",
  holiday_day_rate: "",
  default_service_commission_type: "" as ServiceCommissionType | "",
  default_service_commission_value: "",
  // ⚠️ قديمة — اتشالت من الفورم، سايبها هنا بس لو احتجنا نقراها من الباك
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

const detectDoctorMode = (contract: Contract | null): DoctorMode => {
  if (!contract) return "";

  const hasServices = (contract.service_commissions?.length ?? 0) > 0;

  // ✅ لو فيه تارجت → النمط الجديد "نسب + تارجت وتصعيد"
  if (contract.has_target || contract.target_amount) {
    return "target_escalation";
  }

  // لو فيه خدمات بس من غير تارجت → نمط "سعر ثابت لكل خدمة"
  if (hasServices) return "fixed_per_service";

  // غير كده → نسبة ثابتة
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
  commission_type: "percentage",
  commission_value: 0,
  // ✅ جديد — للنمط "نسب + تارجت وتصعيد"
  doctor_service_price: 0,
  is_laser: false,
});

const StaffContractFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ===== staffId يتحكم في وضع الصفحة كلها =====
  const [staffId, setStaffId] = useState<number | null>(id ? Number(id) : null);
  const isEditStaff = !!id;
  const contractUnlocked = !!staffId;

  const [tab, setTab] = useState<TabKey>("staff");
  const [staffSaved, setStaffSaved] = useState(false);

  const [form, setForm] = useState(initialStaffForm);
  const [contractForm, setContractForm] = useState(emptyContractForm);
  const [doctorMode, setDoctorMode] = useState<DoctorMode>("");
  const [deptRows, setDeptRows] = useState<(DepartmentCommission & { _key: number })[]>([]);
  const [serviceRows, setServiceRows] = useState<(ServiceCommission & { _key: number })[]>([]);
  const [existingContract, setExistingContract] = useState<Contract | null>(null);

  // ===== جلب بيانات الموظف نفسه (وضع التعديل فقط) =====
  const { data: staffResp } = useFetch<any>({
    queryKey: ["staff-detail", id],
    endpoint: `auth/staff/${id}`,
    enabled: isEditStaff,
  });
  const staff: Staff | null = staffResp?.data ?? (staffResp?.id ? staffResp : null);

  // ✅ قسم الطبيب — بنستخدمه لفلترة الخدمات
  const doctorDepartmentId = staff?.department_id ?? null;

  useEffect(() => {
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
            achieved_target: !!(staff as any).achieved_target,
          }
        : initialStaffForm
    );
  }, [staff]);

  // ===== قوائم مساعدة =====
  const { data: roleData } = useFetch<{ data: Role[] }>({ queryKey: ["roles"], endpoint: "auth/roles" });
  const roles = roleData?.data ?? (Array.isArray(roleData) ? (roleData as any) : []);

  const { data: deptData } = useFetch<{ data: Department[] }>({
    queryKey: ["departments"],
    endpoint: "departments",
  });
  const departments = deptData?.data ?? (Array.isArray(deptData) ? (deptData as any) : []);
  const contractType = contractForm.contract_type;

  // ===== جلب العقد الحالي لنفس الموظف =====
  const { data: contractData } = useFetch<any>({
    queryKey: ["staff-contract", staffId],
    endpoint: "contracts",
    params: { user_id: staffId, per_page: 100 },
    enabled: contractUnlocked,
  });

  // ===== جلب الخدمات (مفلترة حسب قسم الطبيب) =====
  const { data: servicesData } = useFetch<any>({
    queryKey: ["services-list", doctorDepartmentId],
    endpoint: "services",
    params: {
      per_page: -1,
      ...(doctorDepartmentId ? { department_id: doctorDepartmentId } : {}),
    },
    enabled:
      tab === "contract" &&
      contractType === "doctor" &&
      !!doctorDepartmentId &&
      (doctorMode === "fixed_per_service" || doctorMode === "target_escalation"),
  });
  const servicesList: any[] = servicesData?.data ?? (Array.isArray(servicesData) ? servicesData : []);
  const serviceOptions = useMemo(
    () => servicesList.map((s) => ({ value: String(s.id), label: s.name ?? s.title ?? `خدمة #${s.id}` })),
    [servicesList]
  );

  // ✅ helper: يرجع سعر الخدمة من الـ list
  const getServicePrice = (serviceId: number): number => {
    const found = servicesList.find((s: any) => Number(s.id) === Number(serviceId));
    return Number(found?.price ?? found?.cost ?? 0);
  };

  useEffect(() => {
    if (!staffId) return;
    if (!contractData) {
      setExistingContract(null);
      return;
    }

    const list: any[] = Array.isArray(contractData?.data)
      ? contractData.data
      : Array.isArray(contractData)
      ? contractData
      : contractData?.data?.id
      ? [contractData.data]
      : contractData?.id
      ? [contractData]
      : [];

    const raw = list.find((c: any) => Number(c.user_id) === Number(staffId)) ?? null;
    const found: Contract | null = raw?.id ? raw : null;
    setExistingContract(found);

    if (!found) {
      setContractForm(emptyContractForm);
      setDoctorMode("");
      setDeptRows([]);
      setServiceRows([]);
      return;
    }

    setContractForm({
      title: found.title ?? "",
      contract_type: found.contract_type ?? "",
      medication_commission_type: (found as any).medication_commission_type ?? "percentage",
      is_active: found.is_active ?? true,
      notes: found.notes ?? "",
      hourly_rate: found.hourly_rate != null ? String(found.hourly_rate) : "",
      overtime_hour_rate: found.overtime_hour_rate != null ? String(found.overtime_hour_rate) : "",
      late_deduction_rate_per_hour:
        found.late_deduction_rate_per_hour != null ? String(found.late_deduction_rate_per_hour) : "",
      applies_department_commission: found.applies_department_commission ?? false,
      device_session_commission:
        found.device_session_commission != null ? String(found.device_session_commission) : "",
      // ✅ نقرا القيمة من الـ key المناسب حسب النوع
      medication_commission_value:
        (found as any).medication_commission_value != null
          ? String((found as any).medication_commission_value)
          : "",
      medication_commission_percentage:
        (found as any).medication_commission_percentage != null
          ? String((found as any).medication_commission_percentage)
          : (found as any).medication_sales_percentage != null
          ? String((found as any).medication_sales_percentage)
          : "",
      holiday_day_rate: found.holiday_day_rate != null ? String(found.holiday_day_rate) : "",
      default_service_commission_type: found.default_service_commission_type ?? "percentage",
      default_service_commission_value:
        found.default_service_commission_value != null ? String(found.default_service_commission_value) : "",
      // ⚠️ قديمة — مش بتستخدم في النمط الجديد بس بنقراها لو موجودة
      laser_service_commission_percentage:
        found.laser_service_commission_percentage != null
          ? String(found.laser_service_commission_percentage)
          : "",
      other_service_commission_percentage:
        found.other_service_commission_percentage != null
          ? String(found.other_service_commission_percentage)
          : "",
      has_target: found.has_target ?? false,
      target_amount: found.target_amount != null ? String(found.target_amount) : "",
      target_type: found.target_type ?? "doctor_income",
      target_achieved_hourly_rate:
        found.target_achieved_hourly_rate != null ? String(found.target_achieved_hourly_rate) : "",
      target_achieved_laser_percentage:
        found.target_achieved_laser_percentage != null ? String(found.target_achieved_laser_percentage) : "",
      target_achieved_other_percentage:
        found.target_achieved_other_percentage != null ? String(found.target_achieved_other_percentage) : "",
      target_bonus: found.target_bonus != null ? String(found.target_bonus) : "",
    });
    setDoctorMode(detectDoctorMode(found));
    setDeptRows(found.department_commissions?.map((d) => ({ ...d, _key: Math.random() })) ?? []);
    setServiceRows(
      found.service_commissions?.map((s) => ({
        _key: Math.random(),
        service_id: s.service_id,
        commission_type: s.commission_type,
        commission_value: s.commission_value,
        doctor_service_price: (s as any).doctor_service_price ?? 0,
        is_laser: (s as any).is_laser ?? false,
      })) ?? []
    );
  }, [contractData, staffId]);


  // ===== حفظ الموظف =====
  const { mutate: saveStaff, isLoading: savingStaff } = useMutate({
    endpoint: isEditStaff ? `auth/staff/${id}` : "auth/staff",
    method: isEditStaff ? "put" : "post",
    mutationKey: ["staff-save"],
    invalidateKeys: [["staff"]],
    successMessage: isEditStaff
      ? "تم تعديل بيانات الموظف بنجاح"
      : "تم إضافة الموظف بنجاح، تقدر تضيف له عقد دلوقتي",
    onSuccess: (res: any) => {
      const newId = res?.data?.id ?? res?.id ?? staffId;
      setStaffId(newId);
      setStaffSaved(true);
      setTab("contract");
      if (!isEditStaff) navigate(`/staff/${newId}/edit`, { replace: true });
    },
  });

  const handleStaffSubmit = (e: React.FormEvent) => {
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
      // achieved_target: form.achieved_target ? 1 : 0,
    };
    if (!isEditStaff || form.password) payload.password = form.password;
    saveStaff(payload);
  };

  // ===== حفظ العقد =====
  const isEditContract = !!existingContract;
  const { mutate: saveContract, isLoading: savingContract } = useMutate({
    endpoint: isEditContract ? `contracts/${existingContract?.id}` : "contracts",
    method: isEditContract ? "put" : "post",
    mutationKey: ["contract-save"],
    invalidateKeys: [["contracts"], ["staff-contract", staffId]],
    successMessage: isEditContract ? "تم تعديل العقد بنجاح" : "تم إضافة العقد بنجاح",
    onSuccess: () => navigate("/staff"),
  });

  const num = (v: string) => (v === "" ? undefined : Number(v));

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) return;

    // ✅ validation: لازم يختار نوع عمولة الأدوية
    if (contractType === "nurse" && !contractForm.medication_commission_type) {
      alert("لازم تختار نوع عمولة الأدوية الأول");
      return;
    }

    // ✅ validation: النمط الجديد لازم فيه خدمة واحدة على الأقل
    if (
      contractType === "doctor" &&
      doctorMode === "target_escalation" &&
      serviceRows.length === 0
    ) {
      alert("لازم تضيف خدمة واحدة على الأقل في نمط نسب + تارجت وتصعيد");
      return;
    }

    const base: Record<string, any> = {
      user_id: staffId,
      title: contractForm.title,
      contract_type: contractForm.contract_type,
      is_active: contractForm.is_active,
      notes: contractForm.notes || null,
    };

    if (contractType === "receptionist") {
      Object.assign(base, {
        hourly_rate:  0,
        overtime_hour_rate: num(contractForm.overtime_hour_rate),
        late_deduction_rate_per_hour: num(contractForm.late_deduction_rate_per_hour),
        applies_department_commission: contractForm.applies_department_commission,
        department_commissions: contractForm.applies_department_commission
          ? deptRows.map(({ department_id, percentage }) => ({
              department_id: Number(department_id),
              percentage: Number(percentage),
            }))
          : [],
      });
    }

    if (contractType === "nurse") {
      const medicationPayload: Record<string, any> = {
        device_session_commission: num(contractForm.device_session_commission),
        medication_commission_type: contractForm.medication_commission_type,
        holiday_day_rate: num(contractForm.holiday_day_rate),
        overtime_hour_rate: num(contractForm.overtime_hour_rate),
        late_deduction_rate_per_hour: num(contractForm.late_deduction_rate_per_hour),
      };

      // ✅ الـ key بيتبعت حسب نوع العمولة المختار
      if (contractForm.medication_commission_type === "fixed") {
        medicationPayload.medication_commission_value = num(contractForm.medication_commission_value);
      } else {
        medicationPayload.medication_commission_percentage = num(
          contractForm.medication_commission_percentage
        );
      }

      Object.assign(base, medicationPayload);
    }

    if (contractType === "doctor") {
      if (doctorMode === "fixed_per_service") {
        Object.assign(base, {
          service_commissions: serviceRows.map(
            ({ service_id, commission_type, commission_value }) => ({
              service_id: Number(service_id),
              commission_type,
              commission_value: Number(commission_value),
            })
          ),
        });
      } else if (doctorMode === "flat_percentage") {
        Object.assign(base, {
          default_service_commission_type: contractForm.default_service_commission_type,
          default_service_commission_value: num(contractForm.default_service_commission_value),
        });
      } else if (doctorMode === "target_escalation") {
        Object.assign(base, {
          hourly_rate: 0,
          has_target: contractForm.has_target,
          target_amount: num(contractForm.target_amount),
          target_type: "doctor_income", // ✅ ثابت — مخفي في الفورم
          target_achieved_hourly_rate: num(contractForm.target_achieved_hourly_rate),
          target_achieved_laser_percentage: num(contractForm.target_achieved_laser_percentage),
          target_achieved_other_percentage: num(contractForm.target_achieved_other_percentage),
          target_bonus: num(contractForm.target_bonus) ?? 0,

          // ✅ الخدمات بسعر محاسبة الطبيب و is_laser
          service_commissions: serviceRows.map(
            ({ service_id, doctor_service_price, is_laser, commission_type, commission_value }) => ({
              service_id: Number(service_id),
              // ✅ لو مش ليزر، ناخد سعر الخدمة الأصلي
              doctor_service_price: is_laser
                ? Number(doctor_service_price) || 0
                : getServicePrice(Number(service_id)),
              is_laser: !!is_laser,
              commission_type,
              commission_value: Number(commission_value) || 0,
            })
          ),
        });
      }
    }

    saveContract(base);
  };

  const pageTitle = isEditStaff ? "تعديل بيانات الموظف والعقد" : "إضافة موظف جديد";

  return (
    <div>
      <PageHeader
        title={pageTitle}
        // subtitle="بيانات الموظف والعقد كل واحد له API منفصل"
        action={
          <button className="btn-secondary" onClick={() => navigate("/staff")}>
            <FiArrowRight size={16} /> رجوع للقائمة
          </button>
        }
      />

      <div className="card p-6">
        {/* ===== أزرار التبويبات ===== */}
        <div className="mb-4 flex gap-2 border-b border-ink/10">
          <button
            type="button"
            onClick={() => setTab("staff")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-bold transition ${
              tab === "staff" ? "border-primary-600 text-primary-600" : "border-transparent text-ink/50"
            }`}
          >
            بيانات الموظف
            {staffSaved && <FiCheckCircle size={14} className="text-primary-600" />}
          </button>
          <button
            type="button"
            disabled={!contractUnlocked}
            onClick={() => contractUnlocked && setTab("contract")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-bold transition ${
              tab === "contract" ? "border-primary-600 text-primary-600" : "border-transparent text-ink/50"
            } ${!contractUnlocked ? "cursor-not-allowed opacity-40" : ""}`}
            title={!contractUnlocked ? "احفظ بيانات الموظف أولاً" : undefined}
          >
            {!contractUnlocked && <FiLock size={12} />}
            العقد <span className="font-normal text-ink/40">(اختياري)</span>
          </button>
        </div>

        {/* ===== تبويب: بيانات الموظف ===== */}
        {tab === "staff" && (
          <form onSubmit={handleStaffSubmit} className="flex flex-col gap-4">
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
              {/* <TextField
                label="البريد الإلكتروني"
                name="email"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              /> */}
              <TextField
                label={isEditStaff ? "كلمة المرور (اتركها فارغة لعدم التغيير)" : "كلمة المرور"}
                name="password"
                type="password"
                required={!isEditStaff}
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
            <div className="flex flex-col gap-2">
              <CheckboxField
                label="الموظف نشط"
                name="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              {/* <CheckboxField
                label="حقق التارجت؟"
                name="achieved_target"
                checked={form.achieved_target}
                onChange={(e) => setForm({ ...form, achieved_target: e.target.checked })}
              /> */}
            </div>
            <div className="mt-2 flex gap-3">
              <button type="button" onClick={() => navigate("/staff")} className="btn-secondary flex-1">
                إلغاء
              </button>
              <button type="submit" disabled={savingStaff} className="btn-primary flex-1">
                {savingStaff ? "جاري الحفظ..." : staffSaved ? "حفظ والمتابعة للعقد" : "حفظ ومتابعة"}
              </button>
            </div>
          </form>
        )}

        {/* ===== تبويب: العقد ===== */}
        {tab === "contract" && contractUnlocked && (
          <form onSubmit={handleContractSubmit} className="flex flex-col gap-4">
            <p className="rounded-lg bg-paper px-3 py-2 text-xs text-ink/50">
              العقد اختياري، لو مش عايز تضيف عقد دلوقتي اضغط "تخطي والرجوع".
            </p>

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="نوع العقد"
                name="contract_type"
                required
                value={contractForm.contract_type}
                onChange={(e) =>
                  setContractForm({ ...contractForm, contract_type: e.target.value as ContractType })
                }
                options={CONTRACT_TYPES}
                placeholder="اختر نوع العقد"
              />
              <TextField
                label="عنوان العقد"
                name="title"
                required
                value={contractForm.title}
                onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                placeholder="مثال: عقد موظف استقبال"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-bold text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-ink/20 text-primary-600"
                checked={contractForm.is_active}
                onChange={(e) => setContractForm({ ...contractForm, is_active: e.target.checked })}
              />
              العقد فعال
            </label>

            {contractType === "receptionist" && (
              <div className="flex flex-col gap-4 rounded-xl border border-ink/10 p-4">
                <div className="grid grid-cols-3 gap-4">
                  <TextField
                    label="سعر الساعة الإضافية"
                    name="overtime_hour_rate"
                    type="number"
                    step="0.01"
                    value={contractForm.overtime_hour_rate}
                    onChange={(e) => setContractForm({ ...contractForm, overtime_hour_rate: e.target.value })}
                  />
                  <TextField
                    label="خصم ساعة التأخير"
                    name="late_deduction_rate_per_hour"
                    type="number"
                    step="0.01"
                    value={contractForm.late_deduction_rate_per_hour}
                    onChange={(e) =>
                      setContractForm({ ...contractForm, late_deduction_rate_per_hour: e.target.value })
                    }
                  />
                    {/* <TextField
                      label="hourly_rate (افتراضي 0)"
                      name="hourly_rate"
                      type="number"
                      step="0.01"
                      value={contractForm.hourly_rate}
                      onChange={(e) => setContractForm({ ...contractForm, hourly_rate: e.target.value })}
                    /> */}
                </div>

                <label className="flex items-center gap-2 text-sm font-bold text-ink">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-ink/20 text-primary-600"
                    checked={contractForm.applies_department_commission}
                    onChange={(e) =>
                      setContractForm({ ...contractForm, applies_department_commission: e.target.checked })
                    }
                  />
                  تطبيق نسبة عمولة من مبيعات أقسام معينة
                </label>

                {contractForm.applies_department_commission && (
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
                            options={departments.map((d: Department) => ({ value: d.id, label: d.name }))}
                            placeholder="اختر القسم"
                          />
                        </div>
                        <div className="w-32">
                          <TextField
                            label="النسبة "
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

            {contractType === "nurse" && (
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink/10 p-4">
                <TextField
                  label="عمولة جلسة الجهاز (ج.م)"
                  name="device_session_commission"
                  type="number"
                  step="0.01"
                  value={contractForm.device_session_commission}
                  onChange={(e) =>
                    setContractForm({ ...contractForm, device_session_commission: e.target.value })
                  }
                />

                {/* ✅ نوع عمولة الأدوية */}
                <SelectField
                  label="نوع عمولة الأدوية"
                  name="medication_commission_type"
                  required
                  value={contractForm.medication_commission_type}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      medication_commission_type: e.target.value as "fixed" | "percentage",
                    })
                  }
                  options={[
                    { value: "percentage", label: "نسبة مئوية (%)" },
                    { value: "fixed", label: "مبلغ ثابت (ج.م)" },
                  ]}
                  placeholder="اختر نوع العمولة"
                />

                {/* ✅ القيمة — الـ key والليبل بيتغيروا حسب النوع */}
                {contractForm.medication_commission_type === "fixed" ? (
                  <TextField
                    label="قيمة عمولة الأدوية (ج.م)"
                    name="medication_commission_value"
                    type="number"
                    step="0.01"
                    value={contractForm.medication_commission_value}
                    onChange={(e) =>
                      setContractForm({ ...contractForm, medication_commission_value: e.target.value })
                    }
                  />
                ) : (
                  <TextField
                    label="نسبة مبيعات الأدوية (%)"
                    name="medication_commission_percentage"
                    type="number"
                    step="0.01"
                    value={contractForm.medication_commission_percentage}
                    onChange={(e) =>
                      setContractForm({
                        ...contractForm,
                        medication_commission_percentage: e.target.value,
                      })
                    }
                  />
                )}

                <TextField
                  label="بدل يوم الإجازة (ج.م)"
                  name="holiday_day_rate"
                  type="number"
                  step="0.01"
                  value={contractForm.holiday_day_rate}
                  onChange={(e) => setContractForm({ ...contractForm, holiday_day_rate: e.target.value })}
                />
                <TextField
                  label="سعر الساعة الإضافية"
                  name="overtime_hour_rate"
                  type="number"
                  step="0.01"
                  value={contractForm.overtime_hour_rate}
                  onChange={(e) => setContractForm({ ...contractForm, overtime_hour_rate: e.target.value })}
                />
                <TextField
                  label="خصم ساعة التأخير"
                  name="late_deduction_rate_per_hour"
                  type="number"
                  step="0.01"
                  value={contractForm.late_deduction_rate_per_hour}
                  onChange={(e) =>
                    setContractForm({ ...contractForm, late_deduction_rate_per_hour: e.target.value })
                  }
                />
              </div>
            )}

            {contractType === "doctor" && (
              <div className="flex flex-col gap-4 rounded-xl border border-ink/10 p-4">
                <SelectField
                  label="نمط احتساب عمولة الطبيب"
                  name="doctor_mode"
                  required
                  value={doctorMode}
                  onChange={(e) => setDoctorMode(e.target.value as DoctorMode)}
                  options={DOCTOR_COMMISSION_MODES.map((m) => ({ value: m.value, label: m.label }))}
                  placeholder="اختر طريقة احتساب العمولة"
                />
                {doctorMode && (
                  <p className="-mt-2 text-xs text-ink/50">
                    {DOCTOR_COMMISSION_MODES.find((m) => m.value === doctorMode)?.hint}
                  </p>
                )}

                {doctorMode === "fixed_per_service" && (
                  <div className="flex flex-col gap-2">
                    {!doctorDepartmentId && (
                      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        ⚠️ الطبيب مش متسجل في قسم — لازم تحدد القسم في تبويب "بيانات الموظف" الأول عشان تقدر تختار الخدمات.
                      </p>
                    )}

                    {serviceRows.map((row, idx) => (
                      <div key={row._key} className="flex items-end gap-2">
                        <div className="flex-1">
                          <SearchableSelect
                            label="الخدمة"
                            value={row.service_id || null}
                            onChange={(val) => {
                              const next = [...serviceRows];
                              next[idx] = { ...row, service_id: Number(val) };
                              setServiceRows(next);
                            }}
                            options={serviceOptions}
                            placeholder="ابحث عن خدمة..."
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
                      disabled={!doctorDepartmentId}
                      onClick={() => setServiceRows([...serviceRows, emptyServiceRow()])}
                      className="btn-secondary self-start disabled:opacity-40"
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
                      required
                      value={contractForm.default_service_commission_type}
                      onChange={(e) =>
                        setContractForm({
                          ...contractForm,
                          default_service_commission_type: e.target.value as ServiceCommissionType,
                        })
                      }
                      options={SERVICE_COMMISSION_TYPES}
                      placeholder="اختر نوع العمولة"
                    />
                    <TextField
                      label="القيمة"
                      name="default_service_commission_value"
                      type="number"
                      step="0.01"
                      value={contractForm.default_service_commission_value}
                      onChange={(e) =>
                        setContractForm({ ...contractForm, default_service_commission_value: e.target.value })
                      }
                    />
                  </div>
                )}

                {doctorMode === "target_escalation" && (
                  <>
                    {/* سعر الساعة */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <TextField
                        label="سعر الساعة (ج.م)"
                        name="hourly_rate"
                        type="number"
                        step="0.01"
                        value={contractForm.hourly_rate}
                        onChange={(e) =>
                          setContractForm({ ...contractForm, hourly_rate: e.target.value })
                        }
                      />
                    </div>

                    {/* ✅ الخدمات المشمولة — ليزر + سعر محاسبة + نوع العمولة + القيمة */}
                    <div className="flex flex-col gap-2 rounded-xl border border-ink/10 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-ink">الخدمات المشمولة بالعمولة</p>
                        <p className="text-xs text-ink/40">
                          سعر المحاسبة = السعر اللي الطبيب بيتحاسب عليه (مش سعر الفاتورة)
                        </p>
                      </div>

                      {!doctorDepartmentId ? (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          ⚠️ الطبيب مش متسجل في قسم — لازم تحدد القسم في تبويب "بيانات الموظف" الأول عشان تقدر تختار الخدمات.
                        </p>
                      ) : serviceRows.length === 0 ? (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          لازم تضيف خدمة واحدة على الأقل.
                        </p>
                      ) : null}

                      {serviceRows.map((row, idx) => {
                        // ✅ لو مفيش ليزر، القيمة = price بتاع الخدمة و disabled
                        const servicePrice = getServicePrice(row.service_id);
                        const doctorPrice = row.is_laser
                          ? Number(row.doctor_service_price ?? 0)
                          : servicePrice;

                        return (
                          <div
                            key={row._key}
                            className="flex flex-wrap items-end gap-2 rounded-lg border border-ink/10 p-2"
                          >
                            <div className="min-w-[180px] flex-1">
                              <SearchableSelect
                                label="الخدمة"
                                value={row.service_id || null}
                                onChange={(val) => {
                                  const next = [...serviceRows];
                                  const newServiceId = Number(val);
                                  const newServicePrice = getServicePrice(newServiceId);
                                  // ✅ لو مش ليزر، نحدّث القيمة تلقائي بسعر الخدمة
                                  next[idx] = {
                                    ...row,
                                    service_id: newServiceId,
                                    doctor_service_price: row.is_laser
                                      ? row.doctor_service_price
                                      : newServicePrice,
                                  };
                                  setServiceRows(next);
                                }}
                                options={serviceOptions}
                                placeholder="ابحث عن خدمة..."
                              />
                            </div>

                            {/* ✅ checkbox الليزر — بقى في الأول */}
                            <div className="flex w-20 flex-col items-center pb-2">
                              <label className="mb-1 text-[11px] text-ink/50">ليزر؟</label>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-ink/20 text-primary-600"
                                checked={!!row.is_laser}
                                onChange={(e) => {
                                  const next = [...serviceRows];
                                  const isLaser = e.target.checked;
                                  next[idx] = {
                                    ...row,
                                    is_laser: isLaser,
                                    // ✅ لو اتفعّل: نسيب القيمة الحالية (يقدر يعدّلها)
                                    // ✅ لو اتشال: نرجّعها لسعر الخدمة
                                    doctor_service_price: isLaser
                                      ? row.doctor_service_price || servicePrice
                                      : servicePrice,
                                  };
                                  setServiceRows(next);
                                }}
                              />
                            </div>

                            {/* ✅ سعر محاسبة الطبيب — disabled لو مش ليزر */}
                            <div className="w-32">
                              <TextField
                                label="سعر محاسبة الطبيب"
                                name={`service_price_${idx}`}
                                type="number"
                                step="0.01"
                                disabled={!row.is_laser}
                                value={String(doctorPrice)}
                                onChange={(e) => {
                                  const next = [...serviceRows];
                                  next[idx] = {
                                    ...row,
                                    doctor_service_price: Number(e.target.value),
                                  };
                                  setServiceRows(next);
                                }}
                              />
                            </div>

                            <div className="w-32">
                              <SelectField
                                label="نوع العمولة"
                                name={`service_type_${idx}`}
                                value={row.commission_type}
                                onChange={(e) => {
                                  const next = [...serviceRows];
                                  next[idx] = {
                                    ...row,
                                    commission_type: e.target.value as ServiceCommissionType,
                                  };
                                  setServiceRows(next);
                                }}
                                options={SERVICE_COMMISSION_TYPES}
                              />
                            </div>

                            <div className="w-24">
                              <TextField
                                label="القيمة"
                                name={`service_value_${idx}`}
                                type="number"
                                step="0.01"
                                value={String(row.commission_value || "")}
                                onChange={(e) => {
                                  const next = [...serviceRows];
                                  next[idx] = {
                                    ...row,
                                    commission_value: Number(e.target.value),
                                  };
                                  setServiceRows(next);
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setServiceRows(serviceRows.filter((_, i) => i !== idx))
                              }
                              className="mb-1 rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        disabled={!doctorDepartmentId}
                        onClick={() => setServiceRows([...serviceRows, emptyServiceRow()])}
                        className="btn-secondary self-start disabled:opacity-40"
                      >
                        <FiPlus size={15} /> إضافة خدمة
                      </button>
                    </div>

                    {/* التارجت والتصعيد */}
                    <label className="flex items-center gap-2 text-sm font-bold text-ink">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-ink/20 text-primary-600"
                        checked={contractForm.has_target}
                        onChange={(e) =>
                          setContractForm({ ...contractForm, has_target: e.target.checked })
                        }
                      />
                      تفعيل نظام التارجت والتصعيد
                    </label>

                    {contractForm.has_target && (
                      <div className="grid grid-cols-2 gap-4 rounded-xl bg-paper p-4">
                        <TextField
                          label="قيمة التارجت (ج.م)"
                          name="target_amount"
                          type="number"
                          step="0.01"
                          value={contractForm.target_amount}
                          onChange={(e) =>
                            setContractForm({ ...contractForm, target_amount: e.target.value })
                          }
                        />

                        {/* ✅ target_type اتشال من الفورم — بيتبعت ثابت doctor_income */}

                        <TextField
                          label="سعر الساعة بعد التارجت"
                          name="target_achieved_hourly_rate"
                          type="number"
                          step="0.01"
                          value={contractForm.target_achieved_hourly_rate}
                          onChange={(e) =>
                            setContractForm({
                              ...contractForm,
                              target_achieved_hourly_rate: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="نسبة الليزر بعد التارجت (%)"
                          name="target_achieved_laser_percentage"
                          type="number"
                          step="0.01"
                          value={contractForm.target_achieved_laser_percentage}
                          onChange={(e) =>
                            setContractForm({
                              ...contractForm,
                              target_achieved_laser_percentage: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="نسبة باقي الخدمات بعد التارجت (%)"
                          name="target_achieved_other_percentage"
                          type="number"
                          step="0.01"
                          value={contractForm.target_achieved_other_percentage}
                          onChange={(e) =>
                            setContractForm({
                              ...contractForm,
                              target_achieved_other_percentage: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="بونص تحقيق التارجت (ج.م)"
                          name="target_bonus"
                          type="number"
                          step="0.01"
                          value={contractForm.target_bonus}
                          onChange={(e) =>
                            setContractForm({ ...contractForm, target_bonus: e.target.value })
                          }
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
              value={contractForm.notes}
              onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
              placeholder="اختياري"
            />

            <div className="mt-2 flex gap-3">
              <button type="button" onClick={() => navigate("/staff")} className="btn-secondary flex-1">
                تخطي والرجوع
              </button>
              <button type="submit" disabled={savingContract || !contractType} className="btn-primary flex-1">
                {savingContract ? "جاري الحفظ..." : isEditContract ? "حفظ تعديل العقد" : "حفظ العقد"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StaffContractFormPage;