export interface DashboardSection {
  id: string;
  reportKey: string; // نفس key في REPORTS_LIST
  title: string; // اسم الجدول
  keys: string[]; // أسماء محتملة للمصفوفة داخل الـ JSON
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: "daily-safe-transactions",
    reportKey: "daily-safe",
    title: "الحركات التفصيلية (الخزنة اليومية)",
    keys: ["detailed_movements"],
  },
  {
    id: "departments",
    reportKey: "departments",
    title: "الأقسام",
    keys: ["departments", "departments_performance"],
  },
  {
    id: "doctors",
    reportKey: "doctors",
    title: "الأطباء",
    keys: ["doctors", "doctors_performance"],
  },
  {
    id: "expenses-by-category",
    reportKey: "expenses-salaries",
    title: "المصروفات حسب الفئة",
    keys: ["by_category", "categories", "expenses_by_category"],
  },
  {
    id: "expenses-details",
    reportKey: "expenses-salaries",
    title: "تفاصيل المصروفات",
    keys: ["expenses", "expenses_details", "expense_details"],
  },
  {
    id: "payrolls",
    reportKey: "expenses-salaries",
    title: "تفاصيل كشوف المرتبات",
    keys: ["payrolls", "payroll", "salaries", "payroll_details"],
  },
  {
    id: "transactions-ledger",
    reportKey: "transactions-ledger",
    title: "سجل الحركات المالي",
    keys: ["ledger_movements"],
  },
];