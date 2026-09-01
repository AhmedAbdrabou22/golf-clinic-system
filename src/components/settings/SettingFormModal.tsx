import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import type { Setting } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  setting: Setting | null;
}

const SettingFormModal = ({ open, onClose, setting }: Props) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue(setting?.value ?? "");
  }, [open, setting]);

  const { mutate, isLoading } = useMutate({
    endpoint: `settings/${setting?.id}`,
    method: "put",
    mutationKey: ["setting-save"],
    invalidateKeys: [["settings"]],
    successMessage: "تم تحديث الإعداد بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ value });
  };

  return (
    <Modal open={open} onClose={onClose} title={`تعديل: ${setting?.key ?? setting?.name ?? ""}`} width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="القيمة"
          name="value"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SettingFormModal;
