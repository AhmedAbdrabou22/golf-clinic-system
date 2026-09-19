/**
 * ⚠️ ملف إضافي وليس بديل عن types/index.ts
 * انسخ المحتوى ده وضيفه جوه types/index.ts الأصلي عندك
 * (استخدمت PaymentMethod و PaginatedResponse و ApiEnvelope اللي مفروض موجودين بالفعل عندك من موديول Expenses)
 *
 * ملحوظة مهمة: الـ Postman collection ملهاش أمثلة Response محفوظة لـ Contracts/Payroll،
 * فالحقول الموجودة هنا مبنية على أجسام الـ Request (POST/PUT) في الكوليكشن.
 * لو الـ backend بيرجع حقول إضافية (زي user object أو breakdown items)، هنعدلها بعد ما تتأكد من شكل الـ response الفعلي.
 */

import { PaymentMethod } from "@/types";

// ============ Staff Contracts ============

export type ContractType = "receptionist" | "nurse" | "doctor";

export interface DepartmentCommission {
  department_id: number;
  percentage: number;
}

export type ServiceCommissionType = "fixed" | "percentage";

export interface ServiceCommission {
  service_id: number;
  commission_type: ServiceCommissionType;
  commission_value: number;
}

export type ContractTargetType = "doctor_income";

export interface Contract {
  id: number;
  user_id: number;
  user?: { id: number; name: string } | null;
  title: string;
  contract_type: ContractType;
  is_active: boolean;

  // Receptionist
  hourly_rate?: number | null;
  overtime_hour_rate?: number | null;
  late_deduction_rate_per_hour?: number | null;
  applies_department_commission?: boolean;
  department_commissions?: DepartmentCommission[];

  // Nurse
  device_session_commission?: number | null;
  medication_sales_percentage?: number | null;
  holiday_day_rate?: number | null;

  // Doctor — عمولة ثابتة لكل خدمة
  service_commissions?: ServiceCommission[];

  // Doctor — نسبة عامة على كل الخدمات
  default_service_commission_type?: ServiceCommissionType | null;
  default_service_commission_value?: number | null;

  // Doctor — جلدية/ليزر + تارجت وتصعيد
  laser_service_commission_percentage?: number | null;
  other_service_commission_percentage?: number | null;
  has_target?: boolean;
  target_amount?: number | null;
  target_type?: ContractTargetType | null;
  target_achieved_hourly_rate?: number | null;
  target_achieved_laser_percentage?: number | null;
  target_achieved_other_percentage?: number | null;
  target_bonus?: number | null;
  achieved_target?: boolean;

  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============ Payroll ============

export type PayrollStatus = "draft" | "approved" | "paid";

// بند تفصيلي في مسير الراتب (لو الـ API بيرجعه ضمن Show Payroll)
export interface PayrollItem {
  label: string;
  amount: number;
  type?: "earning" | "deduction";
}

export interface Payroll {
  id: number;
  user_id: number;
  user?: { id: number; name: string } | null;
  month: string; // "2026-09"

  base_salary?: number | null;
  commissions_total?: number | null;
  overtime_total?: number | null;
  holiday_days?: number | null;
  holiday_allowance?: number | null;
  other_allowances?: number | null;
  deductions?: number | null;
  late_deduction_total?: number | null;
  net_salary?: number | null;

  status: PayrollStatus;
  payment_method?: PaymentMethod | null;
  paid_at?: string | null;
  approved_at?: string | null;
  notes?: string | null;

  items?: PayrollItem[];

  created_at?: string;
  updated_at?: string;
}

export interface GeneratePayrollPayload {
  user_id: number;
  month: string;
  holiday_days?: number;
  other_allowances?: number;
  deductions?: number;
  notes?: string;
}