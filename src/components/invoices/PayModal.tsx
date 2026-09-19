import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { TextField, SelectField, TextareaField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import { PAYMENT_METHODS } from "@/utils/constants";
import type { Invoice } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

const PayModal = ({ open, onClose, invoice }: Props) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const remaining = Number(invoice?.remaining_amount ?? invoice?.total ?? 0);

  useEffect(() => {
    if (open) {
      setAmount(remaining ? String(remaining) : "");
      setPaymentMethod("cash");
      setNotes("");
    }
  }, [open, remaining]);

  const { mutate, isLoading } = useMutate({
    endpoint: `invoices/${invoice?.id}/pay`,
    method: "post",
    mutationKey: ["invoice-pay"],
    invalidateKeys: [["invoices"], ["invoice", invoice?.id]],
    successMessage: "تم تسجيل الدفعة بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > remaining) return;
    mutate({
      amount: Number(amount),
      payment_method: paymentMethod,
      notes,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={`دفع فاتورة #${invoice?.id ?? ""}`} width="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-xl bg-mint-100/70 p-3 text-sm font-bold text-ink">
          المتبقي على الفاتورة: <span className="text-primary-600">{remaining} ج.م</span>
        </div>

        <TextField
          label="المبلغ المدفوع"
          name="amount"
          type="number"
          min={1}
          max={remaining}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <SelectField
          label="طريقة الدفع"
          name="payment_method"
          required
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          options={PAYMENT_METHODS}
        />

        <TextareaField
          label="ملاحظات"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثال: سداد دفعة نقدية من المبلغ المتبقي"
        />

        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading || Number(amount) > remaining || Number(amount) <= 0}
            className="btn-primary flex-1"
          >
            {isLoading ? "جاري الحفظ..." : "تأكيد الدفع"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PayModal;