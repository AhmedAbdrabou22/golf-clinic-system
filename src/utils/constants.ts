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
} from "react-icons/fi";

export interface NavLink {
  to: string;
  label: string;
  icon: IconType;
  group: "clinic" | "inventory" | "admin";
}

export const NAV_LINKS: NavLink[] = [
  { to: "/", label: "الرئيسية", icon: FiGrid, group: "clinic" },
  { to: "/patients", label: "المرضى", icon: FiUsers, group: "clinic" },
  { to: "/appointments", label: "الحجوزات", icon: FiCalendar, group: "clinic" },
  { to: "/invoices", label: "الفواتير", icon: FiFileText, group: "clinic" },
  { to: "/shifts", label: "الشفتات", icon: FiClock, group: "clinic" },
  { to: "/departments", label: "الأقسام", icon: FiLayers, group: "admin" },
  { to: "/services", label: "الخدمات", icon: FiTag, group: "admin" },
  { to: "/suppliers", label: "الموردين", icon: FiTruck, group: "inventory" },
  { to: "/items", label: "المخزون", icon: FiPackage, group: "inventory" },
  { to: "/purchase-invoices", label: "فواتير الشراء", icon: FiShoppingCart, group: "inventory" },
  { to: "/staff", label: "الموظفين", icon: FiUserCheck, group: "admin" },
  { to: "/roles", label: "الأدوار والصلاحيات", icon: FiShield, group: "admin" },
  { to: "/settings", label: "الإعدادات", icon: FiSettings, group: "admin" },
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

export const APPOINTMENT_STATUSES: { value: string; label: string; tone: string }[] = [
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
  value?: string | null
) => list.find((i) => i.value === value)?.label ?? value ?? "—";



export const ITEM_UNITS = [
  { value: "ml", label: "مللي" },
  { value: "half_ml", label: "نص مللي" },
  { value: "gram", label: "جرام" },
  { value: "half_gram", label: "نص جرام" },
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