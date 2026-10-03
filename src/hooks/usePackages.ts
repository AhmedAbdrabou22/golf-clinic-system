import useFetch from "./useFetch";
import useMutate from "./useMutate";
import type { ClinicPackage } from "@/types/packages";

// يدعم array مباشر أو { data: [...] } أو { data: { data: [...] } }
export const toArray = <T,>(res: any): T[] => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

export const usePackagesList = () => {
  const q = useFetch<any>({ queryKey: ["packages"], endpoint: "packages" });
  return { ...q, packages: toArray<ClinicPackage>(q.data) };
};

export const useLookups = () => {
  const deps = useFetch<any>({ queryKey: ["departments"], endpoint: "departments" });
  const services = useFetch<any>({ queryKey: ["services"], endpoint: "services" });
  const products = useFetch<any>({ queryKey: ["items"], endpoint: "items" });
  return {
    departments: toArray<any>(deps.data),
    services: toArray<any>(services.data),
    products: toArray<any>(products.data),
  };
};

export const useSavePackage = (id?: number) =>
  useMutate({
    endpoint: id ? `packages/${id}` : "packages",
    mutationKey: ["packages", "save", id ?? "new"],
    method: id ? "put" : "post",
    invalidateKeys: [["packages"]],
  });

export const useDeletePackage = () =>
  useMutate({
    endpoint: (id: number) => `packages/${id}`,
    mutationKey: ["packages", "delete"],
    method: "delete",
    invalidateKeys: [["packages"]],
  });