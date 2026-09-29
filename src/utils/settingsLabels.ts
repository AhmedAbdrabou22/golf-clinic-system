/**
 * ترجمة عربية لمفاتيح الإعدادات.
 * أي مفتاح جديد يتضاف هنا، ولو مش موجود بنستخدم display_name من الـ API أو المفتاح نفسه.
 */
export const SETTINGS_LABELS: Record<string, string> = {
  // ─── بيانات العيادة ─────────────────────────
  clinic_name: "اسم العيادة",
  clinic_phone: "رقم هاتف العيادة",
  clinic_address: "عنوان العيادة",
  clinic_email: "البريد الإلكتروني للعيادة",
  clinic_logo: "شعار العيادة",

  // ─── المتابعات ──────────────────────────────
  follow_up_max_days: "أقصى مدة للمتابعة (بالأيام)",
  follow_up_notify_today: "تفعيل إشعارات متابعات اليوم",
  follow_up_reminder_days_before: "تنبيه المتابعات قبل الموعد بـ (أيام)",

  // ─── خصومات الموظفين ────────────────────────
  staff_discount_percentage: "نسبة خصم الموظفين من الخدمات (%)",

  // ─── الحضور والـ GPS ────────────────────────
  enable_gps_attendance: "تفعيل تسجيل الحضور بالـ GPS",
  clinic_latitude: "خط عرض العيادة",
  clinic_longitude: "خط طول العيادة",
  clinic_radius_meters: "نطاق الحضور المسموح (بالمتر)",

  // ─── المخزون ────────────────────────────────
  item_low_stock_threshold: "حد تنبيه انخفاض المخزون للأصناف",

  // ─── إعدادات إضافية محتملة ──────────────────
  currency: "العملة",
  tax_percentage: "نسبة الضريبة (%)",
  appointment_slot_minutes: "مدة الموعد الواحد (بالدقائق)",
  working_hours_start: "بداية ساعات العمل",
  working_hours_end: "نهاية ساعات العمل",
  week_start_day: "أول أيام الأسبوع",
  enable_sms_notifications: "تفعيل إشعارات SMS",
  enable_whatsapp_notifications: "تفعيل إشعارات واتساب",
  invoice_prefix: "بادئة رقم الفاتورة",
  default_payment_method: "طريقة الدفع الافتراضية",
  enable_loyalty_points: "تفعيل نظام نقاط الولاء",
  loyalty_points_per_pound: "نقاط الولاء لكل جنيه",
};

/**
 * يرجع التسمية العربية للمفتاح:
 * 1) من الخريطة الثابتة
 * 2) من display_name اللي راجع من الـ API
 * 3) المفتاح نفسه كـ fallback أخير
 */
export const getSettingLabel = (setting: {
  key?: string;
  display_name?: string | null;
  name?: string;
}): string => {
  const key = setting.key ?? setting.name ?? "";
  return (
    SETTINGS_LABELS[key] ??
    setting.display_name ??
    key ??
    "—"
  );
};