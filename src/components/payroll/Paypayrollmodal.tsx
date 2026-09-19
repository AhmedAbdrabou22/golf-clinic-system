import { useEffect, useState } from "react";
import Modal from "@/components/shared/Modal";
import { SelectField, TextareaField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import { PAYMENT_METHODS } from "@/utils/constants";
import type { PaymentMethod } from "@/types";
import { Payroll } from "@/utils/contractPayroll";

interface Props {
  open: boolean;
  onClose: () => void;
  payroll: Payroll | null;
}

const PayPayrollModal = ({ open, onClose, payroll }: Props) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setPaymentMethod("");
      setNotes("");
    }
  }, [open]);

  const { mutate, isLoading } = useMutate({
    endpoint: `payrolls/${payroll?.id}/pay`,
    method: "post",
    mutationKey: ["payroll-pay"],
    invalidateKeys: [["payrolls"]],
    successMessage: "تم تأكيد صرف الراتب بنجاح",
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ payment_method: paymentMethod, notes: notes || undefined });
  };

  return (
    <Modal open={open} onClose={onClose} title="تأكيد صرف الراتب" width="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-ink/60">
          صرف راتب <span className="font-bold text-ink">{payroll?.user?.name ?? `موظف #${payroll?.user_id}`}</span>{" "}
          عن شهر {payroll?.month}
        </p>
        <SelectField
          label="طريقة الدفع"
          name="payment_method"
          required
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          options={PAYMENT_METHODS}
          placeholder="اختر طريقة الدفع"
        />
        <TextareaField
          label="ملاحظات"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="اختياري"
        />
        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button type="submit" disabled={isLoading || !paymentMethod} className="btn-primary flex-1">
            {isLoading ? "جاري التأكيد..." : "تأكيد الصرف"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PayPayrollModal;