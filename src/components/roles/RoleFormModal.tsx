import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import Modal from "@/components/shared/Modal";
import { TextField } from "@/components/shared/FormField";
import useMutate from "@/hooks/useMutate";
import useFetch from "@/hooks/useFetch"; // افترضت وجود هذا الهوك
import type { Role } from "@/types";

interface Permission {
  id: number;
  name: string;
  label: string;
  group: string;
  action: string;
}

interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

const RoleFormModal = ({ open, onClose, role }: Props) => {
  const isEdit = !!role;
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // جلب كل الصلاحيات
  const { data: permissionsResponse, isLoading: isLoadingPermissions } = useFetch<{
    data: PermissionGroup[];
  }>({
    endpoint: "auth/permissions",
    queryKey: ["permissions"],
    enabled: open,
  });

  const permissionGroups = permissionsResponse?.data ?? [];

  // تعبئة الفورم عند الفتح
useEffect(() => {
  if (!open) return;

  setName(role?.name ?? "");

  // لو لسه الصلاحيات ما اتحملتش، استنى
  if (isLoadingPermissions) return;

  const raw = (role?.permissions ?? []) as any[];

  // ابني map: name → id  و  id → id
  const nameToId = new Map<string, number>();
  permissionGroups.forEach((g) =>
    g.permissions.forEach((p) => nameToId.set(p.name, p.id))
  );

  const ids: number[] = raw
    .map((p) => {
      if (typeof p === "number") return p;                  // أصلاً ID
      if (typeof p === "string") return nameToId.get(p);    // اسم → ID
      if (p && typeof p === "object") return p.id;          // object → ID
      return undefined;
    })
    .filter((x): x is number => typeof x === "number");

  setSelectedIds(ids);
}, [open, role, isLoadingPermissions, permissionGroups]);

  const { mutate, isLoading } = useMutate({
    endpoint: isEdit ? `auth/roles/${role?.id}` : "auth/roles",
    method: isEdit ? "put" : "post",
    mutationKey: ["role-save"],
    invalidateKeys: [["roles"]],
    successMessage: isEdit ? "تم تعديل الدور بنجاح" : "تم إضافة الدور بنجاح",
    onSuccess: onClose,
  });

  // إضافة/إزالة صلاحية
  const togglePermission = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // تحديد/إلغاء كل صلاحيات مجموعة معينة
  const toggleGroup = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...groupIds])]);
    }
  };

  // تحديد الكل / إلغاء الكل
  const toggleAll = () => {
    const allIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // إرسال الـ IDs فقط
    mutate({ name, permissions: selectedIds });
  };

  const allIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));
  const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل الدور" : "إضافة دور جديد"}
      width="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="اسم الدور"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: موظف استقبال"
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="field-label mb-0">
              الصلاحيات ({selectedIds.length} محددة)
            </label>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-primary-600 hover:underline"
            >
              {isAllSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
            </button>
          </div>

          {isLoadingPermissions ? (
            <div className="py-4 text-center text-sm text-gray-400">
              جاري تحميل الصلاحيات...
            </div>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-3">
              {permissionGroups.map((group) => {
                const groupIds = group.permissions.map((p) => p.id);
                const allGroupSelected = groupIds.every((id) =>
                  selectedIds.includes(id)
                );
                const someGroupSelected =
                  !allGroupSelected && groupIds.some((id) => selectedIds.includes(id));

                return (
                  <div key={group.group} className="rounded-md bg-gray-50 p-2">
                    <label className="mb-1.5 flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={allGroupSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someGroupSelected;
                        }}
                        onChange={() => toggleGroup(group)}
                        className="h-4 w-4 accent-primary-500"
                      />
                      <span dir="ltr">{group.group}</span>
                    </label>

                    <div className="grid grid-cols-2 gap-1.5 ps-6">
                      {group.permissions.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-white"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="h-3.5 w-3.5 accent-primary-500"
                          />
                          <span className="text-gray-600">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading || isLoadingPermissions}
            className="btn-primary flex-1"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleFormModal;