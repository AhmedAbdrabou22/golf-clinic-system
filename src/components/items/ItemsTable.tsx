import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import type { Item } from "@/types";

interface Props {
  items: Item[];
  isLoading: boolean;
  onEdit: (i: Item) => void;
  onDelete: (i: Item) => void;
}

const ItemsTable = ({ items, isLoading, onEdit, onDelete }: Props) => {
  const columns: Column<Item>[] = [
    { header: "#", accessor: (r) => r.id },
    { header: "اسم الصنف", accessor: (r) => <span className="font-bold text-ink">{r.name}</span> },
    {
      header: "الكمية بالمخزن",
      accessor: (r) =>
        r.current_stock <= 5 ? (
          <StatusBadge label={`${r.current_stock} — منخفض`} tone="coral" />
        ) : (
          <span>{r.current_stock}</span>
        ),
    },
    {
      header: "سعر البيع",
      accessor: (r) => <span className="font-bold text-primary-600">{r.selling_price} ج.م</span>,
    },
    {
      header: "إجراءات",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(r)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50">
            <FiEdit2 size={16} />
          </button>
          <button onClick={() => onDelete(r)} className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10">
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا توجد أصناف بالمخزن"
      emptyHint="أضف أول صنف دوائي أو مستلزم طبي."
    />
  );
};

export default ItemsTable;
