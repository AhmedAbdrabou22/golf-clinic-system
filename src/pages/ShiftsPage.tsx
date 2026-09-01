import { useState } from "react";
import { FiClock, FiStopCircle } from "react-icons/fi";
import PageHeader from "@/components/shared/PageHeader";
import ShiftOpenForm from "@/components/shifts/ShiftOpenForm";
import ShiftCloseModal from "@/components/shifts/ShiftCloseModal";
import type { Shift } from "@/types";

const STORAGE_KEY = "active_shift";

const ShiftsPage = () => {
  const [activeShift, setActiveShift] = useState<Shift | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [closeOpen, setCloseOpen] = useState(false);

  const handleOpened = (shift: Shift) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shift));
    setActiveShift(shift);
  };

  const handleClosed = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveShift(null);
    setCloseOpen(false);
  };

  return (
    <div>
      <PageHeader title="الشفتات" subtitle="فتح وإغلاق شفتات العمل اليومية" />

      {activeShift ? (
        <div className="card mx-auto max-w-md p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <FiClock size={26} />
          </div>
          <h2 className="font-display text-lg font-bold text-ink">يوجد شفت مفتوح حالياً</h2>
          <p className="mt-1 text-sm text-ink/50">
            الرصيد الافتتاحي: <span className="font-bold text-ink">{activeShift.initial_balance} ج.م</span>
          </p>
          <button onClick={() => setCloseOpen(true)} className="btn-danger mt-5 w-full py-3">
            <FiStopCircle size={18} />
            إغلاق الشفت
          </button>
        </div>
      ) : (
        <ShiftOpenForm onOpened={handleOpened} />
      )}

      <ShiftCloseModal
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        shift={activeShift}
        onClosed={handleClosed}
      />
    </div>
  );
};

export default ShiftsPage;
