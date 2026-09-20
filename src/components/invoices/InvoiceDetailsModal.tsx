import Modal from "@/components/shared/Modal";
import Loader from "@/components/shared/Loader";
import useFetch from "@/hooks/useFetch";
import { INVOICE_TYPES, PAYMENT_METHODS, labelOf } from "@/utils/constants";
import StatusBadge from "@/components/shared/StatusBadge";
import { FiUser, FiInfo, FiPackage, FiTag, FiCalendar, FiCreditCard } from "react-icons/fi";

interface Props {
  open: boolean;
  onClose: () => void;
  invoiceId: number | null;
}

const money = (n?: number | string | null) => `${Number(n ?? 0).toFixed(2)} ج.م`;

const formatDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const INVOICE_STATUS_MAP: Record<string, { label: string; tone: string }> = {
  paid: { label: "مدفوعة", tone: "primary" },
  partially_paid: { label: "مدفوعة جزئياً", tone: "amber" },
  unpaid: { label: "غير مدفوعة", tone: "coral" },
  refunded: { label: "مستردة بالكامل", tone: "coral" },
  partial_refund: { label: "استرداد جزئي", tone: "amber" },
};

const InvoiceDetailsModal = ({ open, onClose, invoiceId }: Props) => {
  const { data, isLoading } = useFetch<{ data: any }>({
    queryKey: ["invoice", invoiceId],
    endpoint: `invoices/${invoiceId}`,
    enabled: open && !!invoiceId,
  });

  const invoice: any = data?.data ?? (data as any);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`فاتورة ${invoice?.invoice_number ?? `#${invoiceId ?? ""}`}`}
      width="lg"
    >
      {isLoading || !invoice ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-5">
          {/* ===== رأس الفاتورة ===== */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mint-100 px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-lg font-extrabold text-ink" dir="ltr">
                {invoice.invoice_number ?? `#${invoice.id}`}
              </span>
              <span className="text-xs text-ink/50">
                {formatDate(invoice.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {invoice.queue_number != null && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary-600">
                  دور: {invoice.queue_number}
                </span>
              )}
              {(() => {
                const s = INVOICE_STATUS_MAP[invoice.status] ?? {
                  label: invoice.status,
                  tone: "neutral",
                };
                return <StatusBadge label={s.label} tone={s.tone as any} />;
              })()}
            </div>
          </div>

          {/* ===== بيانات المريض والطبيب ===== */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiUser size={14} />}
              title="المريض"
              lines={[
                invoice.patient?.name ?? "—",
                invoice.patient?.phone ?? "",
              ]}
            />
            <InfoCard
              icon={<FiUser size={14} />}
              title="الطبيب"
              lines={[
                invoice.doctor?.name ?? "—",
                invoice.nurse?.name ? `الممرض/ة: ${invoice.nurse.name}` : "",
              ]}
            />
            <InfoCard
              icon={<FiTag size={14} />}
              title="نوع الفاتورة"
              lines={[labelOf(INVOICE_TYPES, invoice.type)]}
            />
            <InfoCard
              icon={<FiCreditCard size={14} />}
              title="طريقة الدفع"
              lines={[labelOf(PAYMENT_METHODS, invoice.payment_method)]}
            />
            {invoice.shift && (
              <InfoCard
                icon={<FiCalendar size={14} />}
                title="الوردية"
                lines={[
                  `#${invoice.shift.id} — ${invoice.shift.status === "open" ? "مفتوحة" : "مغلقة"}`,
                ]}
              />
            )}
            {invoice.creator && (
              <InfoCard
                icon={<FiUser size={14} />}
                title="أنشأها"
                lines={[invoice.creator.name]}
              />
            )}
          </div>

          {/* ===== الأصناف ===== */}
          <div className="card p-0">
            <div className="flex items-center gap-2 border-b border-ink/5 px-4 py-3">
              <FiPackage className="text-primary-500" size={16} />
              <span className="font-display text-sm font-extrabold text-ink">
                الأصناف ({(invoice.items ?? []).length})
              </span>
            </div>

            <div className="divide-y divide-ink/5">
              {(invoice.items ?? []).map((it: any, idx: number) => (
                <div key={it.id ?? idx} className="px-4 py-3">
                  {/* السطر الرئيسي */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-ink">
                        {it.item_name ?? it.service_name ?? "—"}
                      </span>
                      <span className="text-[11px] text-ink/50">
                        {it.item_type === "service" ? "خدمة" : "منتج"}
                        {it.service_name && it.item_name !== it.service_name
                          ? ` — ${it.service_name}`
                          : ""}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-bold text-primary-600">
                        {money(it.total_price)}
                      </span>
                      <span className="text-[11px] text-ink/50">
                        الكمية: {it.quantity} × {money(it.unit_price)}
                      </span>
                    </div>
                  </div>

                  {/* الأصناف المستهلكة */}
                  {it.service_items && it.service_items.length > 0 && (
                    <div className="mt-2.5 rounded-lg bg-mint-100/70 px-3 py-2">
                      <p className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-primary-600">
                        <FiInfo size={12} /> الأصناف المستهلكة:
                      </p>
                      <div className="flex flex-col gap-1">
                        {it.service_items.map((si: any) => (
                          <div
                            key={si.id}
                            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px]"
                          >
                            <span className="font-bold text-ink/70">
                              {si.name}
                              <span className="mr-1 text-ink/40">
                                ({si.unit ?? si.stock_unit})
                              </span>
                            </span>
                            <span className="text-ink/60">
                              الكمية: <span className="font-bold">{si.quantity}</span>
                              {" × "}
                              {money(si.price)}
                              {" = "}
                              <span className="font-bold text-primary-600">
                                {money(Number(si.quantity) * Number(si.price))}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* بيانات إضافية للصنف */}
                  {it.returned_qty > 0 && (
                    <p className="mt-1.5 text-[11px] font-bold text-coral-600">
                      مرتجع: {it.returned_qty}
                    </p>
                  )}
                </div>
              ))}

              {(invoice.items ?? []).length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-ink/40">
                  لا توجد أصناف في هذه الفاتورة
                </p>
              )}
            </div>
          </div>

          {/* ===== ملخص الحساب ===== */}
          <div className="card divide-y divide-ink/5 p-0">
            <SummaryRow label="الإجمالي الفرعي" value={invoice.sub_total} />
            {Number(invoice.discount) > 0 && (
              <SummaryRow label="الخصم" value={invoice.discount} negative />
            )}
            <SummaryRow label="الإجمالي" value={invoice.grand_total} bold />
            <SummaryRow label="المدفوع" value={invoice.paid_amount} tone="emerald" />
            {Number(invoice.remaining_amount) > 0 && (
              <SummaryRow label="المتبقي" value={invoice.remaining_amount} tone="coral" bold />
            )}
            {Number(invoice.refunded_amount) > 0 && (
              <SummaryRow label="المسترد" value={invoice.refunded_amount} tone="coral" />
            )}
          </div>

          {/* ===== ملاحظات ===== */}
          {invoice.notes && (
            <div className="rounded-lg border border-ink/10 px-4 py-3 text-sm text-ink/70">
              <span className="font-bold text-ink/50">ملاحظات: </span>
              {invoice.notes}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

/* ===== مكونات مساعدة ===== */

const InfoCard = ({
  icon,
  title,
  lines,
}: {
  icon?: React.ReactNode;
  title: string;
  lines: (string | null | undefined)[];
}) => {
  const filtered = lines.filter((l) => l && l !== "—");
  return (
    <div className="rounded-lg bg-mint-100 px-4 py-3">
      <p className="flex items-center gap-1 text-xs font-bold text-ink/45">
        {icon}
        {title}
      </p>
      {filtered.length > 0 ? (
        filtered.map((l, i) => (
          <p
            key={i}
            className={`mt-0.5 ${i === 0 ? "font-bold text-ink" : "text-[11px] text-ink/50"}`}
            dir={l?.startsWith("+") ? "ltr" : undefined}
          >
            {l}
          </p>
        ))
      ) : (
        <p className="mt-0.5 font-bold text-ink/30">—</p>
      )}
    </div>
  );
};

const SummaryRow = ({
  label,
  value,
  negative,
  bold,
  tone,
}: {
  label: string;
  value?: number | string | null;
  negative?: boolean;
  bold?: boolean;
  tone?: "emerald" | "coral";
}) => {
  if (value == null) return null;

  const color =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "coral"
      ? "text-coral-600"
      : "text-ink";

  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className={`${bold ? "font-bold text-ink" : "text-ink/60"}`}>{label}</span>
      <span className={`${bold ? "font-extrabold" : "font-bold"} ${color}`}>
        {negative ? "− " : ""}
        {money(value)}
      </span>
    </div>
  );
};

export default InvoiceDetailsModal;