import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { PACKAGE_TYPE_OPTIONS, type ClinicPackage } from "@/types/packages";
import { labelOf } from "@/utils/constants";

interface Props {
  packages: ClinicPackage[];
  isLoading: boolean;
  onEdit: (p: ClinicPackage) => void;
  onDelete: (p: ClinicPackage) => void;
  startIndex?: number;
}

const discountOf = (p: ClinicPackage) => {
  const original = Number(p.original_price);
  return original > 0
    ? Math.round((1 - Number(p.price) / original) * 100)
    : 0;
};

const PackagesTable = ({
  packages,
  isLoading,
  onEdit,
  onDelete,
  startIndex = 1,
}: Props) => {
  const columns: Column<ClinicPackage>[] = [
    { header: "#", accessor: (_r, index) => startIndex + index },
    {
      header: "العرض",
      accessor: (r) => (
        <div>
          <p className="font-bold text-ink">{r.name}</p>
          <p className="text-xs text-ink/55">{r.items?.length ?? 0} بند</p>
        </div>
      ),
    },
    {
      header: "النوع",
      accessor: (r) => (
        <StatusBadge label={labelOf(PACKAGE_TYPE_OPTIONS, r.type)} tone="primary" />
      ),
    },
    { header: "القسم", accessor: (r) => r.department_name ?? "—" },
    {
      header: "السعر الأصلي",
      accessor: (r) => (
        <span className="text-ink/40 line-through">{Number(r.original_price)}</span>
      ),
    },
    {
      header: "سعر الباقة",
      accessor: (r) => (
        <span className="font-bold text-ink">{Number(r.price)} ج</span>
      ),
    },
    {
      header: "الخصم",
      accessor: (r) => <StatusBadge label={`${discountOf(r)}%`} tone="primary" />,
    },
    { header: "الصلاحية", accessor: (r) => `${r.validity_days} يوم` },
    {
      header: "الحالة",
      accessor: (r) => (
        <StatusBadge
          label={r.is_active ? "مفعّل" : "متوقف"}
          tone={r.is_active ? "primary" : "coral"}
        />
      ),
    },
    {
      header: "إجراءات",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(r)}
            title="تعديل"
            className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(r)}
            title="حذف"
            className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10"
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
      rows={packages}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا توجد عروض بعد"
      emptyHint="أضف أول باقة أو عرض للعيادة."
    />
  );
};

export default PackagesTable;