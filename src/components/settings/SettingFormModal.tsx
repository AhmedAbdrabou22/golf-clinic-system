// import { useEffect, useState } from "react";
// import Modal from "@/components/shared/Modal";
// import { TextField } from "@/components/shared/FormField";
// import useMutate from "@/hooks/useMutate";
// import type { Setting } from "@/types";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   setting: Setting | null;
// }

// const SettingFormModal = ({ open, onClose, setting }: Props) => {
//   const [value, setValue] = useState("");

//   useEffect(() => {
//     if (open) setValue(setting?.value ?? "");
//   }, [open, setting]);

//   const { mutate, isLoading } = useMutate({
//     endpoint: `settings/${setting?.id}`,
//     method: "put",
//     mutationKey: ["setting-save"],
//     invalidateKeys: [["settings"]],
//     successMessage: "تم تحديث الإعداد بنجاح",
//     onSuccess: onClose,
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     mutate({ value });
//   };

//   return (
//     <Modal open={open} onClose={onClose} title={`تعديل: ${setting?.key ?? setting?.name ?? ""}`} width="sm">
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <TextField
//           label="القيمة"
//           name="value"
//           required
//           value={value}
//           onChange={(e) => setValue(e.target.value)}
//         />
//         <div className="mt-2 flex gap-3">
//           <button type="button" onClick={onClose} className="btn-secondary flex-1">
//             إلغاء
//           </button>
//           <button type="submit" disabled={isLoading} className="btn-primary flex-1">
//             {isLoading ? "جاري الحفظ..." : "حفظ"}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default SettingFormModal;

import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField, CheckboxField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import { getSettingLabel } from "@/utils/settingsLabels";
import type { Setting } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  setting: Setting | null;
}

const SettingFormModal = ({ open, onClose, setting }: Props) => {
  const [value, setValue] = useState("");
  const [boolValue, setBoolValue] = useState(false);

  const isBoolean = setting?.type === "boolean";
  const isNumber = setting?.type === "number";

  useEffect(() => {
    if (!open) return;
    const v = setting?.value ?? "";
    if (isBoolean) {
      setBoolValue(v === "true" || v === "1");
    } else {
      setValue(v);
    }
  }, [open, setting, isBoolean]);

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
    const finalValue = isBoolean ? (boolValue ? "true" : "false") : value;
    mutate({ value: finalValue });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`تعديل: ${getSettingLabel(setting ?? {})}`}
      width="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isBoolean ? (
          <CheckboxField
            label={getSettingLabel(setting ?? {})}
            name="value"
            checked={boolValue}
            onChange={(e) => setBoolValue(e.target.checked)}
          />
        ) : (
          <TextField
            label="القيمة"
            name="value"
            type={isNumber ? "number" : "text"}
            step={isNumber ? "0.01" : undefined}
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )}

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