import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import type { Department } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  department: Department | null;
}

const DepartmentFormModal = ({ open, onClose, department }: Props) => {
  const isEdit = !!department;
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(department?.name ?? "");
  }, [open, department]);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `departments/${department?.id}` : "departments",
    method: isEdit ? "put" : "post",
    mutationKey: ["department-save"],
    invalidateKeys: [["departments"]],
    successMessage: isEdit ? "تم تعديل القسم بنجاح" : "تم إضافة القسم بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ name ,is_active:true});
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل القسم" : "إضافة قسم جديد"}
      width="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="اسم القسم"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: قسم الباطنة"
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

export default DepartmentFormModal;
