import { FiAlertTriangle } from "react-icons/fi";
import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({
  open,
  title = "تأكيد الحذف",
  message = "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
  confirmLabel = "حذف",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onClose} title="" width="sm">
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-500/10 text-coral-500">
        <FiAlertTriangle size={26} />
      </div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="text-sm text-ink/55">{message}</p>
      <div className="mt-3 flex w-full gap-3">
        <button className="btn-secondary flex-1" onClick={onClose} type="button">
          إلغاء
        </button>
        <button
          className="btn-danger flex-1"
          onClick={onConfirm}
          disabled={loading}
          type="button"
        >
          {loading ? "جاري الحذف..." : confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
