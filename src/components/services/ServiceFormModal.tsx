import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "@/components/shared/Modal";
import { TextField, SelectField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import { SERVICE_TYPES } from "@/utils/constants";
import type { Department, Item, Service, ServiceType } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  service: Service | null;
}

interface ItemRow {
  item_id: string;
  quantity: string;
}

const emptyRow = (): ItemRow => ({ item_id: "", quantity: "1" });

const ServiceFormModal = ({ open, onClose, service }: Props) => {
  const isEdit = !!service;
  const [form, setForm] = useState({
    name: "",
    price: "",
    department_id: "",
    type: "consultation" as ServiceType,
  });
  const [itemRows, setItemRows] = useState<ItemRow[]>([emptyRow()]);

  useEffect(() => {
    if (open) {
      setForm({
        name: service?.name ?? "",
        price: service?.price != null ? String(service.price) : "",
        department_id: service?.department_id != null ? String(service.department_id) : "",
        type: service?.type ?? "consultation",
      });
      setItemRows(
        service?.items && service.items.length > 0
          ? service.items.map((i) => ({ item_id: String(i.item_id), quantity: String(i.quantity) }))
          : [emptyRow()]
      );
    }
  }, [open, service]);

  const { data: deptData } = useFetch<{ data: Department[] }>({
    queryKey: ["departments"],
    endpoint: "departments",
    enabled: open,
  });
  const departments = deptData?.data ?? (Array.isArray(deptData) ? (deptData as any) : []);

  const isSession = form.type === "session";

  const { data: itemsData } = useFetch<{ data: Item[] }>({
    queryKey: ["items"],
    endpoint: "items",
    enabled: open && isSession,
  });
  const items = itemsData?.data ?? (Array.isArray(itemsData) ? (itemsData as any) : []);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `services/${service?.id}` : "services",
    method: isEdit ? "put" : "post",
    mutationKey: ["service-save"],
    invalidateKeys: [["services"]],
    successMessage: isEdit ? "تم تعديل الخدمة بنجاح" : "تم إضافة الخدمة بنجاح",
    onSuccess: onClose,
  });

  const updateRow = (idx: number, patch: Partial<ItemRow>) => {
    setItemRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () => setItemRows((rows) => [...rows, emptyRow()]);

  const removeRow = (idx: number) =>
    setItemRows((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Record<string, any> = {
      name: form.name,
      price: Number(form.price),
      department_id: Number(form.department_id),
      type: form.type,
    };

    if (isSession) {
      payload.items = itemRows
        .filter((r) => r.item_id)
        .map((r) => ({ item_id: Number(r.item_id), quantity: Number(r.quantity || 0) }));
    }

    mutate(payload);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "تعديل الخدمة" : "إضافة خدمة جديدة"} width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="اسم الخدمة"
          name="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="مثال: كشف عادي"
        />

        <SelectField
          label="نوع الخدمة"
          name="type"
          required
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as ServiceType })}
          options={SERVICE_TYPES}
        />

        <SelectField
          label="القسم"
          name="department_id"
          required
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
          options={departments.map((d: Department) => ({ value: d.id, label: d.name }))}
        />

        <TextField
          label="السعر (ج.م)"
          name="price"
          type="number"
          min={0}
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        {isSession && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="field-label mb-0">الأصناف المستهلكة في الجلسة</label>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
              >
                <FiPlus size={14} /> إضافة صنف
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {itemRows.map((row, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1">
                    <select
                      className="field-input"
                      value={row.item_id}
                      required
                      onChange={(e) => updateRow(idx, { item_id: e.target.value })}
                    >
                      <option value="">اختر الصنف...</option>
                      {items.map((it: Item) => (
                        <option key={it.id} value={it.id}>
                          {it.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    required
                    placeholder="الكمية"
                    className="field-input w-24"
                    value={row.quantity}
                    onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="mb-0.5 rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10"
                    aria-label="حذف الصنف"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
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

export default ServiceFormModal;