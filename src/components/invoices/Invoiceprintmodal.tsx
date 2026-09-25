import { useEffect, useState } from "react";
import { FiPrinter, FiX } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import { labelOf, INVOICE_TYPES, PAYMENT_METHODS } from "@/utils/constants";

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
    item_type?: "service" | "product";
    unit_price: number;
    quantity: number;
    total_price: number;
  }[];
  created_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** لو عندك الفاتورة كاملة جاهزة (زي بعد الحفظ) */
  invoice?: InvoicePrintData | null;
  /** ✅ لو معاك id بس، المودال هيجيب الداتا بنفسه */
  invoiceId?: number | null;
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

const InvoicePrintModal = ({ open, onClose, invoice, invoiceId }: Props) => {
  const [fetched, setFetched] = useState<InvoicePrintData | null>(null);

  // ✅ اجلب الداتا من الـ API بس لو مفيش invoice مبعوت
  const shouldFetch = open && !invoice && !!invoiceId;

  const { data: fetchedData, isLoading } = useFetch<any>({
    queryKey: ["invoice", invoiceId],
    endpoint: shouldFetch ? `invoices/${invoiceId}` : "",
  });

  useEffect(() => {
    if (!fetchedData) return;
    const d = (fetchedData as any)?.data ?? fetchedData;
    setFetched(d);
  }, [fetchedData]);

  // صفّر الداتا المجلوبة لما نقفل
  useEffect(() => {
    if (!open) setFetched(null);
  }, [open]);

  if (!open) return null;

  const data: InvoicePrintData | null = invoice ?? fetched;

  // لسه بيحمّل
  if (!data && isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
        <div className="rounded-2xl bg-white px-8 py-6 text-sm text-ink/60 shadow-xl">
          جاري تحميل الفاتورة...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
        <div className="rounded-2xl bg-white px-8 py-6 text-sm text-coral-600 shadow-xl">
          لا توجد بيانات للطباعة
          <button onClick={onClose} className="btn-secondary mt-4 w-full">
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  const items = data.items ?? [];
  const hasProduct = items.some((it) => it.item_type === "product");
  const cols = hasProduct ? 4 : 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
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
        {/* أزرار */}
        <div className="no-print flex items-center justify-between border-b border-ink/10 px-5 py-3">
          <h3 className="font-display text-base font-extrabold text-ink">
            الفاتورة جاهزة
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn-primary !px-3 !py-1.5 text-sm"
            >
              <FiPrinter size={16} /> طباعة
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-ink/50 hover:bg-paper"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* محتوى الفاتورة */}
        <div id="invoice-print-area" className="overflow-y-auto px-6 py-5">
          <div className="mb-4 text-center">
            <p className="font-display text-lg font-extrabold text-ink">
              عيادة الجولف كلينك
            </p>
            <p className="text-xs text-ink/50">
              فاتورة رقم {data.invoice_number ?? `#${data.id}`}
            </p>
            {data.queue_number != null && (
              <p className="text-xl text-black">
                دور العميل رقم : {data.queue_number}
              </p>
            )}
            <p className="mt-1 text-[11px] text-ink/40">
              {formatDateTime(data.created_at)}
            </p>
          </div>

          <div className="mb-4 flex flex-col gap-1 border-y border-dashed border-ink/15 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/50">المريض</span>
              <span className="font-bold text-ink">
                {data.patient?.name ?? "—"}
              </span>
            </div>
            {data.patient?.phone && (
              <div className="flex justify-between">
                <span className="text-ink/50">الهاتف</span>
                <span dir="ltr" className="font-bold text-ink">
                  {data.patient.phone}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink/50">نوع الفاتورة</span>
              <span className="font-bold text-ink">
                {labelOf(INVOICE_TYPES, data.type)}
              </span>
            </div>
            {data.doctor && (
              <div className="flex justify-between">
                <span className="text-ink/50">الطبيب</span>
                <span className="font-bold text-ink">{data.doctor.name}</span>
              </div>
            )}
            {data.nurse && (
              <div className="flex justify-between">
                <span className="text-ink/50">الممرض/ة</span>
                <span className="font-bold text-ink">{data.nurse.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink/50">طريقة الدفع</span>
              <span className="font-bold text-ink">
                {labelOf(PAYMENT_METHODS, data.payment_method)}
              </span>
            </div>
          </div>

          {/* جدول الأصناف */}
          <table className="mb-4 w-full text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-right text-xs text-ink/50">
                <th className="pb-1.5 font-bold">الصنف</th>
                {hasProduct && <th className="pb-1.5 font-bold">كمية</th>}
                <th className="pb-1.5 font-bold">سعر</th>
                <th className="pb-1.5 text-left font-bold">إجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={cols}
                    className="py-3 text-center text-xs text-ink/40"
                  >
                    لا توجد أصناف
                  </td>
                </tr>
              ) : (
                items.map((it: any) => (
                  <tr key={it.id} className="border-b border-dashed border-ink/10">
                    <td className="py-1.5 text-ink">{it.item_name}</td>

                    {hasProduct && (
                      <td className="py-1.5 text-ink/70">
                        {it.item_type === "product" ? it.quantity : "—"}
                      </td>
                    )}

                    <td className="py-1.5 text-ink/70">{money(it.unit_price)}</td>
                    <td className="py-1.5 text-left font-bold text-ink">
                      {money(it.total_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* الإجماليات */}
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/50">الإجمالي الفرعي</span>
              <span className="text-ink">{money(data.sub_total)}</span>
            </div>
            {Number(data.discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-ink/50">الخصم</span>
                <span className="text-coral-600">- {money(data.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink/15 pt-1.5 text-base">
              <span className="font-bold text-ink">الإجمالي</span>
              <span className="font-extrabold text-primary-600">
                {money(data.grand_total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/50">المدفوع</span>
              <span className="font-bold text-emerald-600">
                {money(data.paid_amount)}
              </span>
            </div>
            {Number(data.remaining_amount) > 0 && (
              <div className="flex justify-between">
                <span className="font-bold text-coral-600">المتبقي</span>
                <span className="font-bold text-coral-600">
                  {money(data.remaining_amount)}
                </span>
              </div>
            )}
            {Number(data.refunded_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-amber-600">مسترد</span>
                <span className="font-bold text-amber-600">
                  {money(data.refunded_amount)}
                </span>
              </div>
            )}
          </div>

          {data.notes && (
            <p className="mt-4 rounded-lg bg-paper px-3 py-2 text-xs text-ink/60">
              {data.notes}
            </p>
          )}

          {data.creator?.name && (
            <p className="mt-4 text-center text-[10px] text-ink/35">
              موظف الشيفت : {data.creator.name}
            </p>
          )}
          <p className="mt-1 text-center text-[10px] text-ink/35">
            شكرًا لزيارتكم
          </p>
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