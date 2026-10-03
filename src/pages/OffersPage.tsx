import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SearchBox from "@/components/shared/SearchBox";
import Pagination from "@/components/shared/Pagination";
import PackagesTable from "@/components/offers/PackagesTable";
import PackageFormModal from "@/components/offers/PackageFormModal";
import {
  PACKAGE_TYPE_OPTIONS,
  type ClinicPackage,
  type PackageType,
} from "@/types/packages";

// يدعم array مباشر أو { data: [...] }
const listOf = <T,>(res: any): T[] =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const OffersPage = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PackageType | "all">("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<ClinicPackage | null>(null);
  const [toDelete, setToDelete] = useState<ClinicPackage | null>(null);

  const { data, isLoading } = useFetch<any>({
    queryKey: ["packages", page],
    endpoint: "packages",
    params: { page },
    keepPrevious: true,
  });
  const allPackages = listOf<ClinicPackage>(data);
  const meta = data?.meta;

  // بيانات الفورم
  const { data: depsRes } = useFetch<any>({ queryKey: ["departments"], endpoint: "departments" });
  const { data: servicesRes } = useFetch<any>({ queryKey: ["services"], endpoint: "services?per_page=-1" });
  const { data: itemsRes } = useFetch<any>({ queryKey: ["items"], endpoint: "items?per_page=-1&type=consumable" });

  const packages = useMemo(
    () =>
      allPackages.filter(
        (p) =>
          (typeFilter === "all" || p.type === typeFilter) &&
          p.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [allPackages, search, typeFilter]
  );

  const { mutate: deletePackage, isLoading: deleting } = useMutate({
    endpoint: (p: ClinicPackage) => `packages/${p.id}`,
    method: "delete",
    mutationKey: ["package-delete"],
    invalidateKeys: [["packages"]],
    successMessage: "تم حذف العرض بنجاح",
    onSuccess: () => setToDelete(null),
  });

  return (
    <div>
      <PageHeader
        title="الباقات والعروض"
        subtitle="إدارة باقات الجلسات والنبضات والمحاليل بالعيادة"
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <FiPlus size={17} /> عرض جديد
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="ابحث باسم العرض..."
          />
        </div>
        <div className="flex gap-2">
          {[{ value: "all", label: "الكل" }, ...PACKAGE_TYPE_OPTIONS].map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setTypeFilter(o.value as PackageType | "all")}
              className={typeFilter === o.value ? "btn-primary" : "btn-secondary"}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <PackagesTable
        packages={packages}
        isLoading={isLoading}
        onEdit={(p) => {
          setSelected(p);
          setFormOpen(true);
        }}
        onDelete={setToDelete}
      />

      <Pagination meta={meta} onPageChange={setPage} />

      <PackageFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        pkg={selected}
        departments={listOf(depsRes)}
        services={listOf(servicesRes)}
        products={listOf(itemsRes)}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deletePackage(toDelete)}
        loading={deleting}
        message={`هل أنت متأكد من حذف "${toDelete?.name}"؟`}
      />
    </div>
  );
};

export default OffersPage;