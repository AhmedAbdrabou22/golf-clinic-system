import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ItemsTable from "@/components/items/ItemsTable";
import ItemFormModal from "@/components/items/ItemFormModal";
import type { Item } from "@/types";

const ItemsPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [toDelete, setToDelete] = useState<Item | null>(null);

  const { data, isLoading } = useFetch<{ data: Item[] }>({
    queryKey: ["items"],
    endpoint: "items",
  });
  const items = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  const { mutate: deleteItem, isLoading: deleting } = useMutate({
    endpoint: (i: Item) => `items/${i.id}`,
    method: "delete",
    mutationKey: ["item-delete"],
    invalidateKeys: [["items"]],
    successMessage: "تم حذف الصنف بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="المخزون"
        subtitle="إدارة أصناف الأدوية والمستلزمات الطبية"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> صنف جديد
          </button>
        }
      />

      <ItemsTable
        items={items}
        isLoading={isLoading}
        onEdit={(i) => {
          setSelected(i);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <ItemFormModal open={formOpen} onClose={() => setFormOpen(false)} item={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteItem(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف "${toDelete?.name}"؟`}
      />
    </div>
  );
};

export default ItemsPage;
