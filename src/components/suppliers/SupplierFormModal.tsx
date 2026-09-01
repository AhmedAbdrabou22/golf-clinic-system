import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import type { Supplier } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

const SupplierFormModal = ({ open, onClose, supplier }: Props) => {
  const isEdit = !!supplier;
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    if (open) {
      setForm({
        name: supplier?.name ?? "",
        phone: supplier?.phone ?? "",
        address: supplier?.address ?? "",
      });
    }
  }, [open, supplier]);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `suppliers/${supplier?.id}` : "suppliers",
    method: isEdit ? "put" : "post",
    mutationKey: ["supplier-save"],
    invalidateKeys: [["suppliers"]],
    successMessage: isEdit ? "تم تعديل المورد بنجاح" : "تم إضافة المورد بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل المورد" : "إضافة مورد جديد"} width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="اسم المورد"
          name="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="مثال: شركة الأدوية المتحدة"
        />
        <TextField
          label="رقم الهاتف"
          name="phone"
          dir="ltr"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="01xxxxxxxxx"
        />
        <TextField
          label="العنوان"
          name="address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
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

export default SupplierFormModal;
