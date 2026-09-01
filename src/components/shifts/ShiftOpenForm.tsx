import { useState } from "react";
import { FiMapPin, FiPlayCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { TextField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import type { Shift } from "@/types";

interface Props {
  onOpened: (shift: Shift) => void;
}

const ShiftOpenForm = ({ onOpened }: Props) => {
  const [initialBalance, setInitialBalance] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const { mutate, isLoading } = useMutate<{ data: Shift }>({
    endpoint: "shifts/open",
    method: "post",
    mutationKey: ["shift-open"],
    successMessage: "تم فتح الشفت بنجاح",
    onSuccess: (res: any) => onOpened(res?.data ?? res),
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        toast.error("تعذر تحديد الموقع، برجاء السماح بالوصول للموقع");
        setLocating(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      initial_balance: Number(initialBalance),
      latitude: coords?.lat ?? 0,
      longitude: coords?.lng ?? 0,
    });
  };

  return (
    <div className="card mx-auto max-w-md p-6">
      <h2 className="font-display text-lg font-bold text-ink">فتح شفت جديد</h2>
      <p className="mt-1 mb-5 text-sm text-ink/50">حدد الرصيد الافتتاحي وموقعك لبدء الشفت</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="الرصيد الافتتاحي (ج.م)"
          name="initial_balance"
          type="number"
          min={0}
          required
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
        />

        <button
          type="button"
          onClick={detectLocation}
          className="btn-secondary w-full"
          disabled={locating}
        >
          <FiMapPin size={16} />
          {locating
            ? "جاري تحديد الموقع..."
            : coords
              ? "تم تحديد الموقع ✓"
              : "تحديد موقعي الحالي"}
        </button>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
          <FiPlayCircle size={18} />
          {isLoading ? "جاري الفتح..." : "فتح الشفت"}
        </button>
      </form>
    </div>
  );
};

export default ShiftOpenForm;
