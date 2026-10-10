
import type { IconType } from "react-icons";
import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiShield,
  FiSettings,
  FiLayers,
  FiTag,
  FiTruck,
  FiPackage,
  FiShoppingCart,
  FiCalendar,
  FiClock,
  FiFileText,
  FiClipboard,
  FiDollarSign,
  FiAward,
  FiCreditCard,
} from "react-icons/fi";
import { SlUserFollowing } from "react-icons/sl";
import { MdLocalOffer } from "react-icons/md";

export interface NavLink {
  to: string;
  label: string;
  icon: IconType;
  group: "clinic" | "inventory" | "admin";
    permission?: string; // اسم صلاحية القراءة المطلوبة

}

// export const NAV_LINKS: NavLink[] = [
//   { to: "/", label: "الرئيسية", icon: FiGrid, group: "clinic" },
//   { to: "/patients", label: "المرضى", icon: FiUsers, group: "clinic" },
//   { to: "/reception", label: "الريسبشن", icon: FiClipboard, group: "clinic" },
//   { to: "/appointments", label: "الحجوزات", icon: FiCalendar, group: "clinic" },
//   { to: "/invoices", label: "الفواتير", icon: FiFileText, group: "clinic" },
//   { to: "/shifts", label: "الشفتات", icon: FiClock, group: "clinic" },

//   {
//     to: "/follow-ups",
//     label: "المتابعات",
//     icon: SlUserFollowing,
//     group: "clinic",
//   },
//       { to: "/offers", label: "العروض", icon: MdLocalOffer, group: "clinic" },

//   { to: "/departments", label: "الأقسام", icon: FiLayers, group: "admin" },
//   { to: "/services", label: "الخدمات", icon: FiTag, group: "admin" },
//   { to: "/suppliers", label: "الموردين", icon: FiTruck, group: "inventory" },
//   {
//     to: "/staff",
//     label: "الموظفين(بالعقود والعملات)",
//     icon: FiUserCheck,
//     group: "admin",
//   },

//   { to: "/items", label: "المخزون", icon: FiPackage, group: "inventory" },
//   {
//     to: "/purchase-invoices",
//     label: "فواتير الشراء",
//     icon: FiShoppingCart,
//     group: "inventory",
//   },
//   {
//     to: "/expenses",
//     label: "المصروفات والأرباح",
//     icon: FiDollarSign,
//     group: "admin",
//   },
//   {
//     to: "/payrolls",
//     label: "الرواتب والمرتبات",
//     icon: FiCreditCard,
//     group: "admin",
//   },
//   // { to: "/contracts", label: "عقود وعمولات", icon: FiAward, group: "admin" },
//   {
//     to: "/reports",
//     label: "التقارير الماليه والتشغيليه",
//     icon: FiAward,
//     group: "admin",
//   },
//   { to: "/roles", label: "الأدوار والصلاحيات", icon: FiShield, group: "admin" },

//   { to: "/settings", label: "الإعدادات", icon: FiSettings, group: "admin" },
// ];

export const NAV_LINKS: NavLink[] = [
  { to: "/", label: "الرئيسية", icon: FiGrid, group: "clinic" },
  { to: "/patients", label: "المرضى", icon: FiUsers, group: "clinic", permission: "read patients" },
  { to: "/reception", label: "الريسبشن", icon: FiClipboard, group: "clinic", permission: "read appointments" },
  { to: "/appointments", label: "الحجوزات", icon: FiCalendar, group: "clinic", permission: "read appointments" },
  { to: "/invoices", label: "الفواتير", icon: FiFileText, group: "clinic", permission: "read invoices" },
  { to: "/shifts", label: "الشفتات", icon: FiClock, group: "clinic", permission: "manage shifts" },
  { to: "/follow-ups", label: "المتابعات", icon: SlUserFollowing, group: "clinic", permission: "read follow_ups" },
  { to: "/offers", label: "العروض", icon: MdLocalOffer, group: "clinic" },

  { to: "/departments", label: "الأقسام", icon: FiLayers, group: "admin", permission: "read departments" },
  { to: "/services", label: "الخدمات", icon: FiTag, group: "admin", permission: "read services" },
  { to: "/suppliers", label: "الموردين", icon: FiTruck, group: "inventory", permission: "read suppliers" },
  { to: "/staff", label: "الموظفين(بالعقود والعملات)", icon: FiUserCheck, group: "admin", permission: "read staff" },

  { to: "/items", label: "المخزون", icon: FiPackage, group: "inventory", permission: "read items" },
  { to: "/purchase-invoices", label: "فواتير الشراء", icon: FiShoppingCart, group: "inventory", permission: "read purchase_invoices" },
  { to: "/expenses", label: "المصروفات والأرباح", icon: FiDollarSign, group: "admin", permission: "read expenses" },
  { to: "/payrolls", label: "الرواتب والمرتبات", icon: FiCreditCard, group: "admin", permission: "read payrolls" },
  { to: "/reports", label: "التقارير الماليه والتشغيليه", icon: FiAward, group: "admin", permission: "read reports" },
  { to: "/roles", label: "الأدوار والصلاحيات", icon: FiShield, group: "admin", permission: "read roles" },
  { to: "/settings", label: "الإعدادات", icon: FiSettings, group: "admin", permission: "read settings" },
];

export const STAFF_TYPES: { value: string; label: string }[] = [
  { value: "admin", label: "مدير" },
  { value: "receptionist", label: "موظف استقبال" },
  { value: "doctor", label: "طبيب" },
  { value: "nurse", label: "ممرض/ة" },
  { value: "sterilization", label: "تعقيم" },
  { value: "accountant", label: "محاسب" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
];

export const VISIT_TYPES = [
  { value: "consultation", label: "كشف" },
  { value: "follow_up", label: "متابعة" },
  { value: "session", label: "جلسة" },
];

export const APPOINTMENT_STATUSES: {
  value: string;
  label: string;
  tone: string;
}[] = [
  { value: "pending", label: "تم الحجز", tone: "amber" },
  { value: "completed", label: "تم الكشف", tone: "primary" },
  { value: "cancelled", label: "تم الإلغاء", tone: "coral" },
];

export const INVOICE_TYPES = [
  { value: "consultation", label: "كشف / استشارة" },
  { value: "session", label: "جلسة طبية" },
  { value: "direct_sale", label: "بيع مباشر" },
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "نقدي" },
  { value: "visa", label: "فيزا" },
  { value: "wallet", label: "محفظة إلكترونية" },
  { value: "insurance", label: "تأمين" },
];

export const labelOf = (
  list: { value: string; label: string }[],
  value?: string | null,
) => list.find((i) => i.value === value)?.label ?? value ?? "—";

export const ITEM_UNITS = [
  { value: "ml", label: "مللي" },
  { value: "gram", label: "جرام" },
  { value: "piece", label: "عدد / قطعة" },
  { value: "strip", label: "شريط" },
  { value: "box", label: "علبة" },
  { value: "vial", label: "فايل (أمبول / زجاجة ميزو)" },
];

export const ITEM_TYPES: { value: string; label: string; hint: string }[] = [
  {
    value: "retailable",
    label: "منتج بيع مباشر",
    hint: "منتجات صيدلية وتجزئة، لها سعر بيع مباشر",
  },
  {
    value: "consumable",
    label: "مستهلك طبي",
    hint: "مستهلكات وحقن تُستخدم داخل الجلسات، سعر البيع 0 دائمًا",
  },
];

export const SERVICE_TYPES = [
  { value: "consultation", label: "كشف" },
  { value: "device", label: "جهاز" },
  { value: "session", label: "جلسة" },
];

// utils/constants.ts — إضافة

export const EXPENSE_CATEGORIES: {
  value: string;
  label: string;
  tone: string;
}[] = [
  { value: "utility", label: "مرافق (كهرباء/نت/مياه)", tone: "primary" },
  { value: "buffet", label: "بوفيه / ضيافة", tone: "amber" },
  { value: "maintenance", label: "صيانة", tone: "coral" },
  { value: "rent", label: "إيجار", tone: "primary" },
  { value: "salaries", label: "مرتبات / نثريات", tone: "amber" },
  { value: "other", label: "أخرى", tone: "gray" },
];

export const toneOf = (
  list: { value: string; tone: string }[],
  value?: string | null,
) => list.find((i) => i.value === value)?.tone ?? "gray";

export const FOLLOW_UP_STATUSES = [
  { value: "pending", label: "قيد الانتظار", tone: "warning" },
  { value: "completed", label: "مكتملة", tone: "success" },
  { value: "cancelled", label: "ملغية", tone: "danger" },
];

// ============ Staff Contracts & Commissions ============

export const CONTRACT_TYPES: { value: string; label: string; tone: string }[] =
  [
    { value: "receptionist", label: "موظف استقبال", tone: "primary" },
    { value: "nurse", label: "تمريض", tone: "amber" },
    { value: "doctor", label: "طبيب / أخصائي", tone: "coral" },
  ];

// وضع احتساب عمولة الطبيب — تصنيف على مستوى الواجهة فقط لاختيار مجموعة الحقول المناسبة
export const DOCTOR_COMMISSION_MODES: {
  value: string;
  label: string;
  hint: string;
}[] = [
  {
    value: "fixed_per_service",
    label: "عمولة ثابتة لكل خدمة",
    hint: "مبلغ ثابت بالجنيه أو نسبة محددة لكل خدمة على حدة (زي العلاج الطبيعي)",
  },
  {
    value: "flat_percentage",
    label: "نسبة عامة من كل الخدمات",
    hint: "نسبة مئوية واحدة تُطبق على إجمالي كل الكشوفات والخدمات (زي التغذية)",
  },
  {
    value: "target_escalation",
    label: "نسب + تارجت وتصعيد",
    hint: "نسبة ليزر ونسبة باقي الخدمات، مع تصعيد تلقائي عند تحقيق تارجت شهري (زي الجلدية والليزر)",
  },
];

export const SERVICE_COMMISSION_TYPES: { value: string; label: string }[] = [
  { value: "fixed", label: "مبلغ ثابت (ج.م)" },
  { value: "percentage", label: "نسبة مئوية (%)" },
];

export const CONTRACT_TARGET_TYPES: { value: string; label: string }[] = [
  { value: "doctor_income", label: "إجمالي دخل الطبيب" },
];

// ============ Payroll System ============

export const PAYROLL_STATUSES: {
  value: string;
  label: string;
  tone: string;
}[] = [
  { value: "draft", label: "مسودة", tone: "gray" },
  { value: "approved", label: "معتمد", tone: "amber" },
  { value: "paid", label: "مصروف", tone: "primary" },
];
