import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "@/components/shared/Modal";
import { SelectField, TextField } from "@/components/shared/FormField";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import type { Item, PurchaseInvoiceItem, Supplier } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const emptyRow: PurchaseInvoiceItem = { item_id: 0, quantity: 1, purchase_price: 0 };

const PurchaseInvoiceFormModal = ({ open, onClose }: Props) => {
  const [supplierId, setSupplierId] = useState("");
  const [rows, setRows] = useState<PurchaseInvoiceItem[]>([{ ...emptyRow }]);

  useEffect(() => {
    if (open) {
      setSupplierId("");
      setRows([{ ...emptyRow }]);
    }
  }, [open]);

  const { data: supplierData } = useFetch<{ data: Supplier[] }>({
    queryKey: ["suppliers"],
    endpoint: "suppliers",
    enabled: open,
  });
  const suppliers = supplierData?.data ?? (Array.isArray(supplierData) ? (supplierData as any) : []);

  const { data: itemData } = useFetch<{ data: Item[] }>({
    queryKey: ["items"],
    endpoint: "items",
    enabled: open,
  });
  const items = itemData?.data ?? (Array.isArray(itemData) ? (itemData as any) : []);

  const { mutate, isLoading } = useMutate({
    endpoint: "purchase-invoices",
    method: "post",
    mutationKey: ["purchase-invoice-save"],
    invalidateKeys: [["purchase-invoices"], ["items"]],
    successMessage: "تم تسجيل فاتورة الشراء بنجاح",
    onSuccess: onClose,
  });

  const updateRow = (idx: number, patch: Partial<PurchaseInvoiceItem>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));
  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);

  const total = rows.reduce((s, r) => s + (r.quantity || 0) * (r.purchase_price || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      supplier_id: Number(supplierId),
      items: rows
        .filter((r) => r.item_id)
        .map((r) => ({
          item_id: Number(r.item_id),
          quantity: Number(r.quantity),
          purchase_price: Number(r.purchase_price),
        })),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="فاتورة شراء جديدة" width="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectField
          label="المورد"
          name="supplier_id"
          required
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          options={suppliers.map((s: Supplier) => ({ value: s.id, label: s.name }))}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="field-label mb-0">الأصناف</label>
            <button type="button" onClick={addRow} className="btn-ghost !px-3 !py-1.5 text-xs">
              <FiPlus size={14} /> إضافة صنف
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 items-end gap-2 rounded-lg border border-ink/10 p-3">
                <div className="col-span-12 sm:col-span-5">
                  <SelectField
                    label="الصنف"
                    name={`item_${idx}`}
                    value={row.item_id || ""}
                    onChange={(e) => updateRow(idx, { item_id: Number(e.target.value) })}
                    options={items.map((it: Item) => ({ value: it.id, label: it.name }))}
                  />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <TextField
                    label="الكمية"
                    name={`qty_${idx}`}
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <TextField
                    label="سعر الشراء"
                    name={`price_${idx}`}
                    type="number"
                    min={0}
                    value={row.purchase_price}
                    onChange={(e) => updateRow(idx, { purchase_price: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={rows.length === 1}
                    className="rounded-lg p-2.5 text-coral-500 hover:bg-coral-500/10 disabled:opacity-30"
                    aria-label="حذف الصف"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-mint-100 px-4 py-3">
          <span className="text-sm font-bold text-ink/60">الإجمالي</span>
          <span className="font-display text-lg font-extrabold text-primary-600">{total} ج.م</span>
        </div>

        <div className="mt-1 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? "جاري الحفظ..." : "حفظ الفاتورة"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PurchaseInvoiceFormModal;
