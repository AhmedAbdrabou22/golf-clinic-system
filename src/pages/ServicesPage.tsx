import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ServicesTable from "@/components/services/ServicesTable";
import ServiceFormModal from "@/components/services/ServiceFormModal";
import type { Service } from "@/types";

const ServicesPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [toDelete, setToDelete] = useState<Service | null>(null);

  const { data, isLoading } = useFetch<{ data: Service[] }>({
    queryKey: ["services"],
    endpoint: "services",
  });
  const services = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  const { mutate: deleteService, isLoading: deleting } = useMutate({
    endpoint: (s: Service) => `services/${s.id}`,
    method: "delete",
    mutationKey: ["service-delete"],
    invalidateKeys: [["services"]],
    successMessage: "تم حذف الخدمة بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="الخدمات"
        subtitle="إدارة الخدمات الطبية المقدمة وأسعارها"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> خدمة جديدة
          </button>
        }
      />

      <ServicesTable
        services={services}
        isLoading={isLoading}
        onEdit={(s) => {
          setSelected(s);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <ServiceFormModal open={formOpen} onClose={() => setFormOpen(false)} service={selected} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteService(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف "${toDelete?.name}"؟`}
      />
    </div>
  );
};

export default ServicesPage;
