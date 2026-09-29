import { FiCreditCard, FiEye, FiRotateCcw, FiTrash2, FiPrinter, FiUser } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { INVOICE_TYPES, PAYMENT_METHODS, labelOf } from "@/utils/constants";
import type { Invoice } from "@/types";

interface Props {
  invoices: Invoice[];
  isLoading: boolean;
  onView: (inv: Invoice) => void;
  onPay: (inv: Invoice) => void;
  onRefund: (inv: Invoice) => void;
  onDelete: (inv: Invoice) => void;
  onPrint: (inv: Invoice) => void;
  /** ✅ جديد — لما تدوس على اسم المريض أو أيقونة البروفايل */
  onViewPatientProfile?: (patientId: number) => void;
}

const INVOICE_STATUS_MAP: Record<string, { label: string; tone: string }> = {
  paid: { label: "مدفوعة", tone: "primary" },
  partially_paid: { label: "مدفوعة جزئياً", tone: "amber" },
  unpaid: { label: "غير مدفوعة", tone: "coral" },
  refunded: { label: "مستردة بالكامل", tone: "coral" },
  partial_refund: { label: "استرداد جزئي", tone: "amber" },
};

const money = (n?: number | null) => `${Number(n ?? 0).toFixed(2)} ج.م`;

const formatDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const InvoicesTable = ({
  invoices,
  isLoading,
  onView,
  onPay,
  onRefund,
  onDelete,
  onPrint,
  onViewPatientProfile,
}: Props) => {
  const columns: Column<any>[] = [
    {
      header: "رقم الفاتورة",
      accessor: (r) => (
        <div className="flex flex-col">
          <span className="font-bold text-ink" dir="ltr">
            {r.invoice_number ?? `#${r.id}`}
          </span>
          {r.queue_number != null && (
            <span className="text-[10px] text-ink/40">دور: {r.queue_number}</span>
          )}
        </div>
      ),
    },
    {
      header: "المريض",
      accessor: (r) => {
        const patientId = r.patient?.id ?? r.patient_id;
        const canView = !!onViewPatientProfile && !!patientId;

        return (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => canView && onViewPatientProfile!(patientId)}
                disabled={!canView}
                className={`text-right font-bold text-ink ${
                  canView
                    ? "hover:text-primary-600 hover:underline cursor-pointer"
                    : "cursor-default"
                }`}
                title={canView ? "عرض بروفايل المريض" : undefined}
              >
                {r.patient?.name ?? `#${r.patient_id}`}
              </button>
              {r.patient?.phone && (
                <span className="text-[10px] text-ink/40" dir="ltr">
                  {r.patient.phone}
                </span>
              )}
            </div>

            {/* ✅ أيقونة بروفايل المريض */}
            {canView && (
              <button
                type="button"
                onClick={() => onViewPatientProfile!(patientId)}
                title="عرض بروفايل المريض"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <FiUser size={14} />
              </button>
            )}
          </div>
        );
      },
    },
    { header: "النوع", accessor: (r) => labelOf(INVOICE_TYPES, r.type) },
    { header: "الطبيب", accessor: (r) => r.doctor?.name ?? "—" },
    {
      header: "طريقة الدفع",
      accessor: (r) => labelOf(PAYMENT_METHODS, r.payment_method),
    },
    {
      header: "الإجمالي",
      accessor: (r) => (
        <span className="font-bold text-primary-600">{money(r.grand_total)}</span>
      ),
    },
    {
      header: "المدفوع",
      accessor: (r) => (
        <span className="font-bold text-emerald-600">{money(r.paid_amount)}</span>
      ),
    },
    {
      header: "المتبقي",
      accessor: (r) =>
        Number(r.remaining_amount ?? 0) > 0 ? (
          <span className="font-bold text-coral-600">{money(r.remaining_amount)}</span>
        ) : (
          <span className="text-ink/30">—</span>
        ),
    },
    {
      header: "الخصم",
      accessor: (r) =>
        Number(r.discount ?? 0) > 0 ? (
          <span className="font-bold text-amber-600">- {money(r.discount)}</span>
        ) : (
          <span className="text-ink/30">—</span>
        ),
    },
    {
      header: "التاريخ",
      accessor: (r) => (
        <span className="text-xs text-ink/60">{formatDate(r.created_at)}</span>
      ),
    },
    {
      header: "الحالة",
      accessor: (r) => {
        const s = INVOICE_STATUS_MAP[r.status] ?? { label: r.status, tone: "neutral" };
        return <StatusBadge label={s.label} tone={s.tone as any} />;
      },
    },
    {
      header: "إجراءات",
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(r)}
            className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
            title="عرض التفاصيل"
          >
            <FiEye size={16} />
          </button>

          <button
            onClick={() => onPrint(r)}
            className="rounded-lg p-2 text-ink/60 hover:bg-ink/5"
            title="طباعة الفاتورة"
          >
            <FiPrinter size={16} />
          </button>

          {Number(r.remaining_amount ?? 0) > 0 && (
            <button
              onClick={() => onPay(r)}
              className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
              title="تسجيل دفعة"
            >
              <FiCreditCard size={16} />
            </button>
          )}

          {Number(r.paid_amount ?? 0) > 0 && r.status !== "refunded" && (
            <button
              onClick={() => onRefund(r)}
              className="rounded-lg p-2 text-amber-500 hover:bg-amber-100"
              title="استرداد"
            >
              <FiRotateCcw size={16} />
            </button>
          )}

          {r.status === "unpaid" && (
            <button
              onClick={() => onDelete(r)}
              className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10"
              title="حذف"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={invoices}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا توجد فواتير بعد"
      emptyHint="أنشئ أول فاتورة كشف أو بيع مباشر."
    />
  );
};

export default InvoicesTable;