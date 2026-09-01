import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { Column } from "@/components/shared/DataTable";
import type { Service } from "@/types";

interface Props {
  services: Service[];
  isLoading: boolean;
  onEdit: (s: Service) => void;
  onDelete: (s: Service) => void;
}

const ServicesTable = ({ services, isLoading, onEdit, onDelete }: Props) => {
  const columns: Column<Service>[] = [
    { header: "#", accessor: (r) => r.id },
    { header: "اسم الخدمة", accessor: (r) => <span className="font-bold text-ink">{r.name}</span> },
    { header: "القسم", accessor: (r) => r.department?.name ?? "—" },
    {
      header: "السعر",
      accessor: (r) => <span className="font-bold text-primary-600">{r.price} ج.م</span>,
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
      rows={services}
      isLoading={isLoading}
      rowKey={(r) => r.id}
      emptyTitle="لا توجد خدمات بعد"
      emptyHint="أضف أول خدمة يتم تقديمها بالعيادة."
    />
  );
};

export default ServicesTable;
