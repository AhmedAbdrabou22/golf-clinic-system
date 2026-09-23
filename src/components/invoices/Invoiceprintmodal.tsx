import { FiPrinter, FiX } from "react-icons/fi";
import { labelOf, INVOICE_TYPES, PAYMENT_METHODS } from "@/utils/constants";

/**
 * ⚠️ الشكل هنا مبني على الـ response اللي بعتهولي. لو فيه حقول زيادة/ناقصة
 * من نفس الـ endpoint في حالات تانية، الكومبوننت بيتعامل معاها بـ "?" فمش هيكسر.
 */
interface InvoicePrintData {
  id: number;
  invoice_number: string;
  queue_number?: number | null;
  type: string;
  status: string;
  payment_method: string;
  sub_total: number;
  discount: number;
  grand_total: number;
  paid_amount: number;
  remaining_amount: number;
  refunded_amount?: number;
  notes?: string | null;
  patient?: { id: number; name: string; phone: string } | null;
  doctor?: { id: number; name: string } | null;
  nurse?: { id: number; name: string } | null;
  creator?: { id: number; name: string } | null;
  items: {
    id: number;
    item_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
  }[];
  created_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  invoice: InvoicePrintData | null;
}

const money = (n?: number | null) => `${Number(n ?? 0).toFixed(2)} ج.م`;

const formatDateTime = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InvoicePrintModal = ({ open, onClose, invoice }: Props) => {
  if (!open || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      {/* ===== قواعد الطباعة: تخفي كل حاجة إلا منطقة الفاتورة ===== */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area {
            position: absolute;
            inset: 0;
            width: 100%;
            padding: 0;
            box-shadow: none;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* ===== أزرار (متختفيش وقت الطباعة) ===== */}
        <div className="no-print flex items-center justify-between border-b border-ink/10 px-5 py-3">
          <h3 className="font-display text-base font-extrabold text-ink">الفاتورة جاهزة</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="btn-primary !px-3 !py-1.5 text-sm">
              <FiPrinter size={16} /> طباعة
            </button>
            <button onClick={onClose} className="rounded-lg p-2 text-ink/50 hover:bg-paper">
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* ===== محتوى الفاتورة القابل للطباعة ===== */}
        <div id="invoice-print-area" className="overflow-y-auto px-6 py-5">
          <div className="mb-4 text-center">
            <p className="font-display text-lg font-extrabold text-ink">عيادة الجولف كلينك</p>
            <p className="text-xs text-ink/50">فاتورة رقم {invoice.invoice_number}</p>
            {invoice.queue_number != null && (
              <p className="text-xs text-ink/50">رقم الدور: {invoice.queue_number}</p>
            )}
            <p className="mt-1 text-[11px] text-ink/40">{formatDateTime(invoice.created_at)}</p>
          </div>

          <div className="mb-4 flex flex-col gap-1 border-y border-dashed border-ink/15 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/50">المريض</span>
              <span className="font-bold text-ink">{invoice.patient?.name ?? "—"}</span>
            </div>
            {invoice.patient?.phone && (
              <div className="flex justify-between">
                <span className="text-ink/50">الهاتف</span>
                <span dir="ltr" className="font-bold text-ink">{invoice.patient.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink/50">نوع الفاتورة</span>
              <span className="font-bold text-ink">{labelOf(INVOICE_TYPES, invoice.type)}</span>
            </div>
            {invoice.doctor && (
              <div className="flex justify-between">
                <span className="text-ink/50">الطبيب</span>
                <span className="font-bold text-ink">{invoice.doctor.name}</span>
              </div>
            )}
            {invoice.nurse && (
              <div className="flex justify-between">
                <span className="text-ink/50">الممرض/ة</span>
                <span className="font-bold text-ink">{invoice.nurse.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink/50">طريقة الدفع</span>
              <span className="font-bold text-ink">{labelOf(PAYMENT_METHODS, invoice.payment_method)}</span>
            </div>
          </div>

          {/* ===== جدول الأصناف ===== */}
          <table className="mb-4 w-full text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-right text-xs text-ink/50">
                <th className="pb-1.5 font-bold">الصنف</th>
                <th className="pb-1.5 font-bold">كمية</th>
                <th className="pb-1.5 font-bold">سعر</th>
                <th className="pb-1.5 text-left font-bold">إجمالي</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it) => (
                <tr key={it.id} className="border-b border-dashed border-ink/10">
                  <td className="py-1.5 text-ink">{it.item_name}</td>
                  <td className="py-1.5 text-ink/70">{it.quantity}</td>
                  <td className="py-1.5 text-ink/70">{money(it.unit_price)}</td>
                  <td className="py-1.5 text-left font-bold text-ink">{money(it.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== الإجماليات ===== */}
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/50">الإجمالي الفرعي</span>
              <span className="text-ink">{money(invoice.sub_total)}</span>
            </div>
            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-ink/50">الخصم</span>
                <span className="text-coral-600">- {money(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink/15 pt-1.5 text-base">
              <span className="font-bold text-ink">الإجمالي</span>
              <span className="font-extrabold text-primary-600">{money(invoice.grand_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/50">المدفوع</span>
              <span className="font-bold text-emerald-600">{money(invoice.paid_amount)}</span>
            </div>
            {Number(invoice.remaining_amount) > 0 && (
              <div className="flex justify-between">
                <span className="font-bold text-coral-600">المتبقي</span>
                <span className="font-bold text-coral-600">{money(invoice.remaining_amount)}</span>
              </div>
            )}
            {Number(invoice.refunded_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-amber-600">مسترد</span>
                <span className="font-bold text-amber-600">{money(invoice.refunded_amount)}</span>
              </div>
            )}
          </div>

          {invoice.notes && (
            <p className="mt-4 rounded-lg bg-paper px-3 py-2 text-xs text-ink/60">{invoice.notes}</p>
          )}

          {invoice.creator?.name && (
            <p className="mt-4 text-center text-[10px] text-ink/35">
              تم الإصدار بواسطة: {invoice.creator.name}
            </p>
          )}
          <p className="mt-1 text-center text-[10px] text-ink/35">شكرًا لزيارتكم</p>
        </div>

        <div className="no-print border-t border-ink/10 px-5 py-3">
          <button onClick={onClose} className="btn-secondary w-full">
            إغلاق بدون طباعة
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintModal;