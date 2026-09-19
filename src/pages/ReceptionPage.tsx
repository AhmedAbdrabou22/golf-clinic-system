

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiUser,
  FiClipboard,
  FiFileText,
  FiActivity,
  FiClock,
} from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import StatusBadge from "@/components/shared/StatusBadge";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";
import AppointmentFormModal from "@/components/appointments/AppointmentFormModal";
import AppointmentStatusMenu from "@/components/appointments/AppointmentStatusMenu";
import InvoiceCreateForm from "@/components/invoices/InvoiceCreateForm";
import type { Appointment, FollowUp, PaginatedResponse } from "@/types";
import { FOLLOW_UP_STATUSES, labelOf, toneOf } from "@/utils/constants";

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

  // ===== أقرب الحجوزات (اليوم وما بعده) =====
  const { data: apptData, isLoading: apptLoading } = useFetch<PaginatedResponse<Appointment>>({
    queryKey: ["appointments"],
    endpoint: "appointments",
    params: { page: 1 },
  });

  // ===== المتابعات =====
const { data: followUpData, isLoading: followUpLoading } = useFetch<PaginatedResponse<FollowUp>>({
  queryKey: ["follow-ups"],
  endpoint: "follow-ups",
  params: { page: 1 },
});
const allFollowUps = followUpData?.data ?? (Array.isArray(followUpData) ? (followUpData as any) : []);

const recentFollowUps = useMemo(
  () =>
    [...allFollowUps]
      .sort((a, b) => (a.follow_up_date > b.follow_up_date ? 1 : -1))
      .slice(0, 4),
  [allFollowUps]
);
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* ===== تلتين الشاشة: فورم فاتورة جديدة ===== */}
        <div className="lg:col-span-3">
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-extrabold text-ink">
            <FiFileText className="text-primary-500" size={18} />
            فاتورة جديدة
          </h2>
          <InvoiceCreateForm />
        </div>

        {/* ===== التلت الأخير: كروت تحت بعض ===== */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* كارت الحجوزات */}
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
                          <AppointmentStatusMenu appointment={a} />
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

          {/* كارت متابعات — هيتعمل لاحقًا */}
          {/* كارت المتابعات */}
<div className="card flex flex-col p-5">
  <div className="mb-4 flex items-center justify-between">
    <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
      <FiActivity className="text-primary-500" size={18} />
      متابعات
    </h2>
    <StatusBadge label={`الكل: ${allFollowUps.length}`} tone="primary" />
  </div>

  <div className="flex-1 space-y-2.5">
    {followUpLoading ? (
      <Loader />
    ) : recentFollowUps.length === 0 ? (
      <EmptyState title="لا توجد متابعات" hint="أضف أول متابعة لمريض." />
    ) : (
      recentFollowUps.map((f: FollowUp) => (
        <div
          key={f.id}
          className="flex items-center justify-between gap-2 rounded-xl bg-mint-100/70 px-3.5 py-2.5"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-bold text-ink">
              <FiUser size={13} className="shrink-0 text-primary-500" />
              {f.patient?.name ?? `#${f.patient_id}`}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/45">
              <FiClock size={12} className="shrink-0" />
              {dayLabel(f.follow_up_date)}
              <StatusBadge
                label={labelOf(FOLLOW_UP_STATUSES, f.status)}
                tone={toneOf(FOLLOW_UP_STATUSES, f.status)}
              />
            </p>
          </div>
          <Link
            to="/follow-ups"
            className="shrink-0 rounded-lg p-2 text-primary-600 hover:bg-white"
            aria-label="عرض المتابعة"
          >
            <FiEdit2 size={15} />
          </Link>
        </div>
      ))
    )}
  </div>

  <div className="mt-4 flex gap-2">
    <Link to="/follow-ups" className="btn-secondary flex-1 !py-2 text-sm">
      كل المتابعات
    </Link>
    <Link to="/follow-ups" className="btn-primary flex-1 !py-2 text-sm">
      <FiPlus size={16} /> متابعة 
    </Link>
  </div>
</div>
        </div>
      </div>

      <AppointmentFormModal
        open={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default ReceptionPage;