import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import type { Shift } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  shift: Shift | null;
  onClosed: () => void;
}

const ShiftCloseModal = ({ open, onClose, shift, onClosed }: Props) => {
  const [finalBalance, setFinalBalance] = useState("");

  const { mutate, isLoading } = useMutate({
    endpoint: `shifts/${shift?.id}/close`,
    method: "post",
    mutationKey: ["shift-close"],
    successMessage: "تم إغلاق الشفت بنجاح",
    onSuccess: () => {
      setFinalBalance("");
      onClosed();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ final_balance: Number(finalBalance) });
  };

  return (
    <Modal open={open} onClose={onClose} title="إغلاق الشفت" width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-lg bg-mint-100 px-4 py-3 text-sm">
          <span className="font-bold text-ink/60">الرصيد الافتتاحي: </span>
          <span className="font-bold text-ink">{shift?.initial_balance} ج.م</span>
        </div>
        <TextField
          label="الرصيد الختامي (ج.م)"
          name="final_balance"
          type="number"
          min={0}
          required
          value={finalBalance}
          onChange={(e) => setFinalBalance(e.target.value)}
        />
        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button type="submit" disabled={isLoading} className="btn-danger flex-1">
            {isLoading ? "جاري الإغلاق..." : "إغلاق الشفت"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ShiftCloseModal;
