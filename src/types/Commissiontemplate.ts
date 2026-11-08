import type { ServiceCommissionType } from "@/utils/contractPayroll";

export interface CommissionTemplateItem {
  id?: number;
  service_id: number;
  doctor_service_price: number;
  is_laser: boolean;
  commission_type: ServiceCommissionType;
  commission_value: number;
  target_commission_value: number;
}

export interface CommissionTemplate {
  id: number;
  name: string;
  description: string | null;
  department_id: number;
  is_active: boolean;
  department?: { id: number; name: string } | null;
  items: CommissionTemplateItem[];
}

export type CommissionTemplatePayload = Omit<CommissionTemplate, "id" | "department">;