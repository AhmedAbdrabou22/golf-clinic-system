import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField, SelectField, CheckboxField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import { ITEM_UNITS, ITEM_TYPES } from "@/utils/constants";
import type { Item, ItemType, ItemUnit } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  item: Item | null;
}

const emptyForm = {
  name: "",
  unit: "" as ItemUnit | "",
  stock_unit: "" as ItemUnit | "",
  conversion_factor: "1",
  type: "retailable" as ItemType,
  current_stock: "",
  selling_price: "",
  is_active: true,
};

const ItemFormModal = ({ open, onClose, item }: Props) => {
  const isEdit = !!item;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      setForm({
        name: item?.name ?? "",
        unit: item?.unit ?? "",
        stock_unit: item?.stock_unit ?? "",
        conversion_factor:
          item?.conversion_factor != null ? String(item.conversion_factor) : "1",
        type: item?.type ?? "retailable",
        current_stock: "0",
        selling_price: item?.selling_price != null ? String(item.selling_price) : "",
        is_active: item?.is_active ?? true,
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

  const isConsumable = form.type === "consumable";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {
      name: form.name,
      unit: form.unit,
      stock_unit: form.stock_unit,
      conversion_factor: Number(form.conversion_factor || 1),
      type: form.type,
      // المستهلكات الطبية سعر بيعها دايمًا صفر لأنها بتتباع جوه الجلسات مش لوحدها
      selling_price: isConsumable ? 0 : Number(form.selling_price || 0),
      is_active: form.is_active,
    };
    if (!isEdit) {
      payload.current_stock = Number(0);
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
          placeholder="مثال: ميزو 5 مل"
        />

        <SelectField
          label="نوع الصنف"
          name="type"
          required
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target.value as ItemType,
              selling_price: e.target.value === "consumable" ? "" : form.selling_price,
            })
          }
          options={ITEM_TYPES.map(({ value, label }) => ({ value, label }))}
        />
        <p className="-mt-2.5 text-xs text-ink/40">
          {ITEM_TYPES.find((t) => t.value === form.type)?.hint}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="وحدة البيع/العرض"
            name="unit"
            required
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value as ItemUnit })}
            options={ITEM_UNITS}
          />
          <SelectField
            label="وحدة التخزين بالمخزن"
            name="stock_unit"
            required
            value={form.stock_unit}
            onChange={(e) => setForm({ ...form, stock_unit: e.target.value as ItemUnit })}
            options={ITEM_UNITS}
          />
        </div>

        <TextField
          label="معامل التحويل"
          name="conversion_factor"
          type="number"
          min={0}
          step="0.01"
          required
          value={form.conversion_factor}
          onChange={(e) => setForm({ ...form, conversion_factor: e.target.value })}
          hint="كام وحدة تخزين تعادل وحدة البيع الواحدة؟ مثال: فايل واحد = 5 مللي → 5"
        />

        {/* {!isEdit && (
          <TextField
            label="الكمية الحالية بالمخزن"
            name="current_stock"
            type="number"
            min={0}
            required
            value={form.current_stock}
            onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
          />
        )} */}

        {!isConsumable && (
          <TextField
            label="سعر البيع (ج.م)"
            name="selling_price"
            type="number"
            min={0}
            required
            value={form.selling_price}
            onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
          />
        )}

        <CheckboxField
          label="الصنف مُفعّل"
          name="is_active"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
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