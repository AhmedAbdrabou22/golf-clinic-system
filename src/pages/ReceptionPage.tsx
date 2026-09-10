import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiEye,
  FiFileText,
  FiUser,
  FiClipboard,
  FiPrinter,
  FiChevronLeft,
} from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import StatusBadge from "@/components/shared/StatusBadge";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";
import AppointmentFormModal from "@/components/appointments/AppointmentFormModal";
import InvoiceFormModal from "@/components/invoices/InvoiceFormModal";
import InvoiceDetailsModal from "@/components/invoices/InvoiceDetailsModal";
import { APPOINTMENT_STATUSES, INVOICE_TYPES, labelOf } from "@/utils/constants";
import type { Appointment, Invoice, PaginatedResponse } from "@/types";

const todayISO = () => new Date().toISOString().split("T")[0];

const dayLabel = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = dateStr.split("T")[0];
  const today = todayISO();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (date === today) return "اليوم";
  if (date === tomorrow) return "غدًا";
  return date;
};

const ReceptionPage = () => {
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);

  // ===== عمود الحجوزات: أقرب الحجوزات (اليوم وما بعده) =====
  const { data: apptData, isLoading: apptLoading } = useFetch<PaginatedResponse<Appointment>>({
    queryKey: ["appointments"],
    endpoint: "appointments",
    params: { page: 1 },
  });
  const allAppointments = apptData?.data ?? (Array.isArray(apptData) ? (apptData as any) : []);
  const upcomingAppointments = useMemo(
    () =>
      [...allAppointments]
        .sort((a, b) => (a.appointment_date > b.appointment_date ? 1 : -1))
        .slice(0, 6),
    [allAppointments]
  );
  const todayCount = allAppointments.filter(
    (a: Appointment) => a.appointment_date?.split("T")[0] === todayISO()
  ).length;

  // ===== عمود الفواتير: أحدث الفواتير =====
  const { data: invData, isLoading: invLoading } = useFetch<PaginatedResponse<Invoice>>({
    queryKey: ["invoices"],
    endpoint: "invoices",
    params: { page: 1 },
  });
  const invoices = invData?.data ?? (Array.isArray(invData) ? (invData as any) : []);
  const recentInvoices = invoices.slice(0, 6);
  const latestInvoice: Invoice | undefined = invoices[0];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-white">
            <FiClipboard size={20} />
          </span>
          <h1 className="font-display text-2xl font-extrabold text-ink">ريسبشن العيادة</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-ink/10 bg-white px-3.5 py-2 text-sm font-bold text-ink/60">
          <FiCalendar size={15} />
          اليوم: {new Date().toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ===== العمود الأول: الحجوزات ===== */}
        <div className="card flex flex-col p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiCalendar className="text-primary-500" size={18} />
              الحجوزات
            </h2>
            <StatusBadge label={`اليوم: ${todayCount}`} tone="primary" />
          </div>

          <div className="flex-1 space-y-2.5">
            {apptLoading ? (
              <Loader />
            ) : upcomingAppointments.length === 0 ? (
              <EmptyState title="لا توجد حجوزات" hint="أضف أول حجز لمريض." />
            ) : (
              upcomingAppointments.map((a: Appointment) => {
                const status = APPOINTMENT_STATUSES.find((s) => s.value === a.status);
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-mint-100/70 px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-bold text-ink">
                        <FiUser size={13} className="shrink-0 text-primary-500" />
                        {a.patient?.name ?? `#${a.patient_id}`}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/45">
                        {dayLabel(a.appointment_date)}
                        {status && (
                          <StatusBadge label={status.label} tone={status.tone as any} />
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAppointment(a);
                        setAppointmentModalOpen(true);
                      }}
                      className="shrink-0 rounded-lg p-2 text-primary-600 hover:bg-white"
                      aria-label="تعديل الحجز"
                    >
                      <FiEdit2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Link to="/appointments" className="btn-secondary flex-1 !py-2 text-sm">
              كل الحجوزات
            </Link>
            <button
              className="btn-primary flex-1 !py-2 text-sm"
              onClick={() => {
                setSelectedAppointment(null);
                setAppointmentModalOpen(true);
              }}
            >
              <FiPlus size={16} /> حجز جديد
            </button>
          </div>
        </div>

        {/* ===== العمود الثاني: الفواتير ===== */}
        <div className="card flex flex-col p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiFileText className="text-primary-500" size={18} />
              الفواتير
            </h2>
            <StatusBadge label={String(invData?.meta?.total ?? invoices.length)} tone="primary" />
          </div>

          <div className="flex-1 space-y-2.5">
            {invLoading ? (
              <Loader />
            ) : recentInvoices.length === 0 ? (
              <EmptyState title="لا توجد فواتير" hint="أنشئ أول فاتورة." />
            ) : (
              recentInvoices.map((inv: Invoice) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-mint-100/70 px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">
                      {inv.patient?.name ?? `#${inv.patient_id}`}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/45">
                      {inv.created_at?.split("T")[0] ?? "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewInvoiceId(inv.id)}
                    className="shrink-0 rounded-lg p-2 text-primary-600 hover:bg-white"
                    aria-label="عرض الفاتورة"
                  >
                    <FiEye size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Link to="/invoices" className="btn-secondary flex-1 !py-2 text-sm">
              الكل
            </Link>
            <button className="btn-primary flex-1 !py-2 text-sm" onClick={() => setInvoiceFormOpen(true)}>
              <FiPlus size={16} /> فاتورة جديدة
            </button>
          </div>
        </div>

        {/* ===== العمود الثالث: أحدث فاتورة (معاينة سريعة) ===== */}
        <div className="card flex flex-col p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <FiFileText className="text-primary-500" size={18} />
              آخر فاتورة
            </h2>
            {latestInvoice && <StatusBadge label={`#${latestInvoice.id}`} tone="primary" />}
          </div>

          {invLoading ? (
            <Loader />
          ) : !latestInvoice ? (
            <EmptyState title="لا توجد فواتير بعد" hint="أنشئ أول فاتورة من هنا." />
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex-1 space-y-2 rounded-xl bg-mint-100/70 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink/50">المريض</span>
                  <span className="font-bold text-ink">{latestInvoice.patient?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink/50">النوع</span>
                  <span className="font-bold text-ink">{labelOf(INVOICE_TYPES, latestInvoice.type)}</span>
                </div>
                {!!latestInvoice.discount && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink/50">خصم</span>
                    <span className="font-bold text-ink">{latestInvoice.discount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-ink/10 pt-2">
                  <span className="font-bold text-ink/60">الإجمالي</span>
                  <span className="font-display text-lg font-extrabold text-primary-600">
                    {latestInvoice.total ?? "—"} ج.م
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="btn-secondary flex-1 !py-2 text-sm"
                  onClick={() => setViewInvoiceId(latestInvoice.id)}
                >
                  <FiChevronLeft size={16} /> تفاصيل
                </button>
                <button className="btn-primary flex-1 !py-2 text-sm" onClick={() => window.print()}>
                  <FiPrinter size={16} /> طباعة
                </button>
              </div>
              <button
                className="btn-ghost mt-2 w-full !py-2 text-sm"
                onClick={() => setInvoiceFormOpen(true)}
              >
                <FiPlus size={16} /> إنشاء فاتورة جديدة
              </button>
            </div>
          )}
        </div>
      </div>

      <AppointmentFormModal
        open={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        appointment={selectedAppointment}
      />
      <InvoiceFormModal open={invoiceFormOpen} onClose={() => setInvoiceFormOpen(false)} />
      <InvoiceDetailsModal
        open={!!viewInvoiceId}
        onClose={() => setViewInvoiceId(null)}
        invoiceId={viewInvoiceId}
      />
    </div>
  );
};

export default ReceptionPage;