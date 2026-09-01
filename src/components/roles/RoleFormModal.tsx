import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import Modal from "@/components/shared/Modal";
import { TextField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import type { Role } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

const RoleFormModal = ({ open, onClose, role }: Props) => {
  const isEdit = !!role;
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permInput, setPermInput] = useState("");

  useEffect(() => {
    if (open) {
      setName(role?.name ?? "");
      setPermissions(role?.permissions ?? []);
      setPermInput("");
    }
  }, [open, role]);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `auth/roles/${role?.id}` : "auth/roles",
    method: isEdit ? "put" : "post",
    mutationKey: ["role-save"],
    invalidateKeys: [["roles"]],
    successMessage: isEdit ? "تم تعديل الدور بنجاح" : "تم إضافة الدور بنجاح",
    onSuccess: onClose,
  });

  const addPermission = () => {
    const value = permInput.trim();
    if (value && !permissions.includes(value)) {
      setPermissions([...permissions, value]);
    }
    setPermInput("");
  };

  const removePermission = (p: string) => setPermissions(permissions.filter((x) => x !== p));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ name, permissions });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الدور" : "إضافة دور جديد"} width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="اسم الدور"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: موظف استقبال"
        />

        <div>
          <label className="field-label">الصلاحيات</label>
          <div className="flex gap-2">
            <input
              value={permInput}
              onChange={(e) => setPermInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPermission();
                }
              }}
              placeholder="مثال: create invoices"
              className="field-input"
              dir="ltr"
            />
            <button type="button" onClick={addPermission} className="btn-secondary shrink-0">
              إضافة
            </button>
          </div>
          {permissions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {permissions.map((p) => (
                <span key={p} className="badge bg-primary-50 text-primary-600" dir="ltr">
                  {p}
                  <button
                    type="button"
                    onClick={() => removePermission(p)}
                    className="hover:text-coral-500"
                    aria-label="حذف"
                  >
                    <FiX size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

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

export default RoleFormModal;
