// ==================== أنواع عامة ====================
export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  links?: Record<string, string | null>;
}

export interface ApiEnvelope<T> {
  status?: boolean;
  message?: string;
  data: T;
}

// ==================== المصادقة والموظفين ====================
export type StaffType =
  | "admin"
  | "receptionist"
  | "doctor"
  | "nurse"
  | "sterilization"
  | "accountant";

export interface Role {
  id: number;
  name: string;
  permissions?: string[];
  created_at?: string;
}

export interface Staff {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role_id: number;
  role?: Role;
  type: StaffType;
  basic_salary?: number;
  is_active: boolean;
  department_id?: number | null;
  department?: Department;
  achieved_target?: number;
}

export interface AuthUser extends Staff {
  permissions?: string[];
}

// ==================== الإعدادات، الأقسام، الخدمات ====================
export interface Department {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  department_id: number;
  department?: Department;
}

export interface Setting {
  id: number;
  key?: string;
  name?: string;
  value: string;
}

// ==================== المخازن والمشتريات ====================
export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  address?: string;
}

export type ItemUnit =
  | "ml"
  | "half_ml"
  | "gram"
  | "half_gram"
  | "piece"
  | "strip"
  | "box"
  | "vial";

export type ItemType = "consumable" | "retailable";

export interface Item {
  id: number;
  name: string;
  unit: ItemUnit;
  type: ItemType;
  current_stock: number;
  selling_price: number;
  purchase_price?: number;
  is_active: boolean;
}

export interface PurchaseInvoiceItem {
  item_id: number;
  quantity: number;
  purchase_price: number;
}

export interface PurchaseInvoice {
  id: number;
  supplier_id: number;
  supplier?: Supplier;
  total?: number;
  created_at?: string;
  items: (PurchaseInvoiceItem & { item?: Item })[];
}

// ==================== المرضى والحجوزات ====================
export type Gender = "male" | "female";

export interface Patient {
  id: number;
  name: string;
  phone: string;
  gender: Gender;
  age: number;
  is_staff?: boolean;
  address?: string;
}

export type VisitType = "consultation" | "follow_up" | "session";
export type AppointmentStatus = "pending" | "completed" | "cancelled";

export interface Appointment {
  id: number;
  patient_id: number;
  patient?: Patient;
  doctor_id: number;
  doctor?: Staff;
  doctor_name?: string;
  service_id: number;
  service?: Service;
  service_name?: string;
  appointment_date: string;
  visit_type: VisitType;
  status: AppointmentStatus;
  shift_id?: number;
  shift?: {
    id: number;
    status?: "open" | "closed";
    initial_balance?: string | number;
    final_balance?: string | number | null;
    start_time?: string;
    end_time?: string | null;
  };
  notes?: string;
  created_by?: number;
  creator_name?: string;
  created_at?: string;
}

// ==================== الشفتات ====================
export interface Shift {
  id: number;
  initial_balance: number;
  final_balance?: number;
  latitude?: number;
  longitude?: number;
  status?: "open" | "closed";
  opened_at?: string;
  closed_at?: string;
  staff?: Staff;
}

// ==================== الفواتير ====================
export type InvoiceType = "consultation" | "session" | "direct_sale";
export type PaymentMethod = "cash" | "visa" | "wallet" | "insurance";

export interface InvoiceItemInput {
  item_type: "service" | "product";
  service_id?: number | null;
  product_id?: number | null;
  quantity: number;
}

export interface InvoiceItem extends InvoiceItemInput {
  id?: number;
  price?: number;
  total?: number;
  service?: Service;
  product?: Item;
}

export interface Invoice {
  id: number;
  patient_id: number;
  patient?: Patient;
  appointment_id?: number | null;
  type: InvoiceType;
  payment_method: PaymentMethod;
  doctor_id?: number | null;
  doctor?: Staff;
  nurse_id?: number | null;
  nurse?: Staff;
  discount?: number;
  notes?: string;
  total?: number;
  status?: "paid" | "refunded" | "partial_refund";
  items: InvoiceItem[];
  created_at?: string;
}



export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from?: number | null;
  to?: number | null;
  path?: string;
}

export interface PaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

export interface PaginatedResponse<T> {
  status?: number | boolean;
  message?: string;
  errors?: any;
  data: T[];
  // links?: PaginationLinks;
  // meta?: PaginationMeta;
}


export type ServiceType = "consultation" | "device" | "session";

export interface ServiceItem {
  item_id: number;
  quantity: number;
  item?: Item;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  department_id: number;
  department?: Department;
  type: ServiceType;
  // مطلوبة فقط لو النوع "session" — الأصناف المستهلكة داخل الجلسة
  items?: ServiceItem[];
}