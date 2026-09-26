import {
  FiDollarSign,
  FiPieChart,
  FiUsers,
  FiActivity,
  FiClipboard,
  FiBriefcase,
  FiFileText,
} from "react-icons/fi";
import type { IconType } from "react-icons";

export interface ReportConfig {
  key: string;
  label: string;
  description: string;
  // endpoint فيه :shiftId لو محتاج رقم شفت في الرابط
  endpoint: string;
  needsDateRange: boolean;
  needsShiftId?: boolean;
  icon: IconType;
}

export const REPORTS_LIST: ReportConfig[] = [
  {
    key: "daily-safe",
    label: "تقرير الخزنة اليومية",
    description: "خزنة كل موظف وشفت خلال اليوم الحالي",
    endpoint: "reports/daily-safe",
    needsDateRange: false,
    icon: FiClipboard,
  },
  {
    key: "shift-safe",
    label: "تقرير خزنة شفت محدد",
    description: "تفاصيل خزنة شفت واحد بالرقم",
    endpoint: "reports/shifts/:shiftId/safe",
    needsDateRange: false,
    needsShiftId: true,
    icon: FiClipboard,
  },
  {
    key: "financial-summary",
    label: "التقرير المالي الشامل",
    description: "الإيرادات والمصروفات وصافي الأرباح (P&L)",
    endpoint: "reports/financial-summary",
    needsDateRange: true,
    icon: FiDollarSign,
  },
  {
    key: "departments",
    label: "تقرير الأقسام",
    description: "أداء الأقسام وأعلى 3 أطباء",
    endpoint: "reports/departments",
    needsDateRange: true,
    icon: FiPieChart,
  },
  {
    key: "doctors",
    label: "أداء الأطباء وإيراداتهم",
    description: "كشوفات وخدمات كل طبيب خلال الفترة",
    endpoint: "reports/doctors",
    needsDateRange: true,
    icon: FiUsers,
  },
  {
    key: "devices",
    label: "استخدام الأجهزة والمستهلكات",
    description: "أرباح الأجهزة ونسبة استهلاك المواد",
    endpoint: "reports/devices",
    needsDateRange: true,
    icon: FiActivity,
  },
  {
    key: "expenses-salaries",
    label: "المصروفات والرواتب",
    description: "المصروفات والرواتب المنصرفة خلال الفترة",
    endpoint: "reports/expenses-salaries",
    needsDateRange: true,
    icon: FiBriefcase,
  },
  {
    key: "transactions-ledger",
    label: "سجل الحركات المالية",
    description: "كل الحركات والتدفقات المالية بالتفصيل",
    endpoint: "reports/transactions-ledger",
    needsDateRange: true,
    icon: FiFileText,
  },
];