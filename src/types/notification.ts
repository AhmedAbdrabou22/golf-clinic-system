export type NotificationType = "follow_up" | "low_stock";

export interface FollowUpNotificationDetails {
  title: string;
  message: string;
  type: "follow_up";
  reminder_type: string;
  days_before: number;
  follow_up_id: number;
  appointment_id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  follow_up_date: string;
  status: string;
}

export interface LowStockNotificationDetails {
  title: string;
  message: string;
  type: "low_stock";
  item_id: number;
  item_name: string;
  current_stock: number;
  threshold: number;
  unit: string;
}

export type NotificationDetails = FollowUpNotificationDetails | LowStockNotificationDetails;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  details: NotificationDetails;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
  created_at_human: string;
}