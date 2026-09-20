import { FiEdit2, FiTrash2, FiInfo } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { CONTRACT_TYPES, labelOf, toneOf } from "@/utils/constants";
import { Contract } from "@/utils/contractPayroll";

interface Props {
  contracts: Contract[];
  isLoading: boolean;
  onEdit: (c: Contract) => void;
  onDelete: (c: Contract) => void;
  startIndex?: number;
}

const money = (n?: number | null) => `${Number(n ?? 0).toFixed(2)} ج.م`;

const formatDate = (s?: string | null) => {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const ContractsTable = ({ contracts, isLoading, onEdit, onDelete, startIndex = 1 }: Props) => {
  const columns: Column<any>[] = [
    // ===== # =====
    { header: "#", accessor: (_r, index) => startIndex + index },

    // ===== الموظف (اسم + إيميل + تليفون) =====
    {
      header: "الموظف",
      accessor: (r) => (
        <div className="flex flex-col">
          <span className="font-bold text-ink">
            {r.user?.name ?? `موظف #${r.user_id}`}
          </span>
          {r.user?.phone && (
            <span className="text-[10px] text-ink/40" dir="ltr">
              {r.user.phone}
            </span>
          )}
        </div>
      ),
    },

    // ===== الراتب الأساسي =====
    {
      header: "الراتب الأساسي",
      accessor: (r) => (
        <span className="font-bold text-ink">
          {money(r.user?.basic_salary)}
        </span>
      ),
    },

    // ===== عنوان العقد =====
    { header: "عنوان العقد", accessor: (r) => r.title },

    // ===== نوع العقد =====
    {
      header: "نوع العقد",
      accessor: (r) => (
        <StatusBadge
          label={labelOf(CONTRACT_TYPES, r.contract_type)}
          tone={toneOf(CONTRACT_TYPES, r.contract_type)}
        />
      ),
    },

    // ===== قيمة العمولة الافتراضية (أهم حقل!) =====
    {
      header: "العمولة الافتراضية",
      accessor: (r) => {
        const type = r.default_service_commission_type;
        const value = r.default_service_commission_value;
        if (!value) return <span className="text-ink/30">—</span>;
        return (
          <span className="font-bold text-primary-600">
            {type === "percentage" ? `${value}%` : money(value)}
          </span>
        );
      },
    },

    // ===== الهدف =====
    {
      header: "الهدف",
      accessor: (r) =>
        r.has_target ? (
          <div className="flex flex-col">
            <span className="font-bold text-ink">{money(r.target_amount)}</span>
            <span className="text-[10px] text-ink/40">
              مكافأة: {money(r.target_bonus)}
            </span>
          </div>
        ) : (
          <span className="text-ink/30">بدون هدف</span>
        ),
    },

    // ===== ساعات العمل =====
    {
      header: "ساعات العمل",
      accessor: (r) => (
        <div className="flex flex-col text-[11px]">
          <span className="font-bold text-ink/70">
            {r.working_hours_per_day ?? 0} س/يوم
          </span>
          {Number(r.hourly_rate) > 0 && (
            <span className="text-ink/40">{money(r.hourly_rate)}/ساعة</span>
          )}
        </div>
      ),
    },

    // ===== فترة العقد =====
    {
      header: "فترة العقد",
      accessor: (r) => {
        if (!r.start_date && !r.end_date) {
          return <span className="text-ink/30">مفتوح</span>;
        }
        return (
          <div className="flex flex-col text-[11px]">
            <span className="text-ink/70">{formatDate(r.start_date)}</span>
            <span className="text-ink/40">→ {formatDate(r.end_date)}</span>
          </div>
        );
      },
    },

    // ===== الحالة =====
    {
      header: "الحالة",
      accessor: (r) => (
        <StatusBadge
          label={r.is_active ? "فعال" : "موقوف"}
          tone={r.is_active ? "primary" : "gray"}
        />
      ),
    },

    // ===== ملاحظات (truncated) =====
    {
      header: "ملاحظات",
      accessor: (r) =>
        r.notes ? (
          <span
            className="block max-w-[140px] truncate text-xs text-ink/60"
            title={r.notes}
          >
            {r.notes}
          </span>
        ) : (
          <span className="text-ink/30">—</span>
        ),
    },

    // ===== إجراءات =====
    {
      header: "إجراءات",
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(r)}
            className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
            aria-label="تعديل"
            title="تعديل"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(r)}
            className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10"
            aria-label="حذف"
            title="حذف"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={contracts}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا يوجد عقود مسجلة"
      emptyHint="أضف أول عقد عمولات لأحد الموظفين لبدء احتساب الرواتب تلقائيًا."
    />
  );
};

export default ContractsTable;