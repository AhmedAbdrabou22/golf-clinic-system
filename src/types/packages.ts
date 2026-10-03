export type PackageType = "sessions" | "pulses" | "units_volume";
export type PackageItemType = "service" | "pulse" | "product";

export interface PackageItem {
  id?: number;
  item_type: PackageItemType;
  service_id?: number | null;
  product_id?: number | null;
  quantity: number;
  unit_price: number;
  notes?: string | null;
}

export interface ClinicPackage {
  id: number;
  name: string;
  description?: string | null;
  department_id: number;
  department_name?: string | null;
  type: PackageType;
  original_price: number;
price: number;
  validity_days: number;
  is_active: boolean;
  items: PackageItem[];
}

export const PACKAGE_TYPE_OPTIONS: { value: PackageType; label: string }[] = [
  { value: "sessions", label: "جلسات" },
  { value: "pulses", label: "نبضات" },
  { value: "units_volume", label: "ملي / وحدات" },
];