import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import useMutate from "@/hooks/useMutate";
import StatusBadge from "@/components/shared/StatusBadge";
import { APPOINTMENT_STATUSES, labelOf } from "@/utils/constants";
import type { Appointment, AppointmentStatus } from "@/types";

const AppointmentStatusMenu = ({ appointment }: { appointment: Appointment }) => {
  const [open, setOpen] = useState(false);

  const { mutate, isLoading } = useMutate({
    endpoint: `appointments/${appointment.id}/status`,
    method: "patch",
    mutationKey: ["appointment-status"],
    invalidateKeys: [["appointments"]],
    successMessage: "تم تحديث حالة الحجز",
  });

  const current = APPOINTMENT_STATUSES.find((s) => s.value === appointment.status);

  const handlePick = (status: AppointmentStatus) => {
    setOpen(false);
    if (status !== appointment.status) mutate({ status });
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1"
      >
        <StatusBadge label={labelOf(APPOINTMENT_STATUSES, appointment.status)} tone={current?.tone} />
        <FiChevronDown size={13} className="text-ink/40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute start-0 top-full z-20 mt-1 w-40 rounded-lg border border-ink/10 bg-white p-1 shadow-soft">
            {APPOINTMENT_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => handlePick(s.value as AppointmentStatus)}
                className="flex w-full items-center rounded-md px-2.5 py-1.5 text-sm font-bold text-ink/70 hover:bg-mint-100"
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentStatusMenu;
