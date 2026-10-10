import { useState } from "react";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import useDebounce from "@/hooks/useDebounce";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import ServicesTable from "@/components/services/ServicesTable";
import ServiceFormModal from "@/components/services/ServiceFormModal";
import type { Service, PaginatedResponse } from "@/types";

const ServicesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [toDelete, setToDelete] = useState<Service | null>(null);

  const { data, isLoading } = useFetch<PaginatedResponse<Service>>({
    queryKey: ["services", page, debouncedSearch],
    endpoint: "services",
    params: {
      page,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    keepPrevious: true,
  });

  const services = data?.data ?? (Array.isArray(data) ? (data as any) : []);
  const meta = (data as any)?.meta;

  const { mutate: deleteService, isLoading: deleting } = useMutate({
    endpoint: (s: Service) => `services/${s.id}`,
    method: "delete",
    mutationKey: ["service-delete"],
    invalidateKeys: [["services"]],
    successMessage: "تم حذف الخدمة بنجاح",
    onSuccess: () => setToDelete(null),
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // نرجع لأول صفحة مع كل بحث جديد
  };

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

      {/* البحث */}
      <div className="relative mb-4 max-w-md">
        <FiSearch
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/35"
          size={17}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="ابحث باسم الخدمة..."
          className="field-input px-10"
        />
        {search && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink/60"
            aria-label="مسح البحث"
          >
            <FiX size={17} />
          </button>
        )}
      </div>

      <ServicesTable
        services={services}
        isLoading={isLoading}
        startIndex={meta?.from ?? 1}
        isSearching={!!debouncedSearch}
        onEdit={(s) => {
          setSelected(s);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <Pagination meta={meta} onPageChange={setPage} />

      <ServiceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        service={selected}
      />

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