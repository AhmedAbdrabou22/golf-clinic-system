import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import type { Item } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  item: Item | null;
}

const ItemFormModal = ({ open, onClose, item }: Props) => {
  const isEdit = !!item;
  const [form, setForm] = useState({ name: "", current_stock: "", selling_price: "" });

  useEffect(() => {
    if (open) {
      setForm({
        name: item?.name ?? "",
        current_stock: item?.current_stock != null ? String(item.current_stock) : "",
        selling_price: item?.selling_price != null ? String(item.selling_price) : "",
      });
    }
  }, [open, item]);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `items/${item?.id}` : "items",
    method: isEdit ? "put" : "post",
    mutationKey: ["item-save"],
    invalidateKeys: [["items"]],
    successMessage: isEdit ? "تم تعديل الصنف بنجاح" : "تم إضافة الصنف بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = { name: form.name };
    if (isEdit) {
      payload.sale_price = Number(form.selling_price);
    } else {
      payload.current_stock = Number(form.current_stock);
      payload.selling_price = Number(form.selling_price);
    }
    mutate(payload);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الصنف" : "إضافة صنف جديد"} width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="اسم الصنف"
          name="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="مثال: بنادول إكسترا"
        />
        {!isEdit && (
          <TextField
            label="الكمية الحالية بالمخزن"
            name="current_stock"
            type="number"
            min={0}
            required
            value={form.current_stock}
            onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
          />
        )}
        <TextField
          label="سعر البيع (ج.م)"
          name="selling_price"
          type="number"
          min={0}
          required
          value={form.selling_price}
          onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
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

export default ItemFormModal;
