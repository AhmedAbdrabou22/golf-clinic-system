import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import PageHeader from "@/components/shared/PageHeader";
import useFetch from "@/hooks/useFetch";
import useMutate from "@/hooks/useMutate";
import type { Department } from "@/types";
import { CommissionTemplate } from "@/types/Commissiontemplate";
const DeleteTemplateButton = ({ id }: { id: number }) => {
  const { mutate, isLoading } = useMutate({
    endpoint: `commission-templates/${id}`,
    method: "delete",
    mutationKey: ["commission-template-delete", id],
    invalidateKeys: [["commission-templates"]],
    successMessage: "تم حذف الخطة بنجاح",
  });

  const handleDelete = () => {
    if (!window.confirm("متأكد إنك عايز تحذف الخطة دي؟")) return;
    mutate({});
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleDelete}
      className="rounded-lg p-2 text-coral-500 hover:bg-coral-500/10 disabled:opacity-40"
      title="حذف"
    >
      <FiTrash2 size={16} />
    </button>
  );
};

const CommissionTemplatesPage = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useFetch<any>({
    queryKey: ["commission-templates"],
    endpoint: "commission-templates",
    params: { per_page: 100 },
  });
  const templates: CommissionTemplate[] = data?.data ?? (Array.isArray(data) ? data : []);

  const { data: deptData } = useFetch<any>({
    queryKey: ["departments"],
    endpoint: "departments",
  });
  const departments: Department[] = deptData?.data ?? (Array.isArray(deptData) ? deptData : []);

  const getDepartmentName = (t: CommissionTemplate): string =>
    t.department?.name ?? departments.find((d) => Number(d.id) === Number(t.department_id))?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="خطط العمولات"
        action={
          <button className="btn-primary" onClick={() => navigate("/commission-templates/new")}>
            <FiPlus size={16} /> إضافة خطة
          </button>
        }
      />

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-right text-ink/50">
              <th className="px-4 py-3 font-bold">اسم الخطة</th>
              <th className="px-4 py-3 font-bold">القسم</th>
              <th className="px-4 py-3 font-bold">عدد الخدمات</th>
              <th className="px-4 py-3 font-bold">الحالة</th>
              <th className="px-4 py-3 font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink/40">
                  جاري التحميل...
                </td>
              </tr>
            )}

            {!isLoading && templates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink/40">
                  مفيش خطط لسه
                </td>
              </tr>
            )}

            {templates.map((t) => (
              <tr key={t.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-bold text-ink">{t.name}</td>
                <td className="px-4 py-3">{getDepartmentName(t)}</td>
                <td className="px-4 py-3">{t.items?.length ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      t.is_active ? "bg-primary-600/10 text-primary-600" : "bg-ink/10 text-ink/50"
                    }`}
                  >
                    {t.is_active ? "فعالة" : "غير فعالة"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/commission-templates/${t.id}/edit`)}
                      className="rounded-lg p-2 text-primary-600 hover:bg-primary-600/10"
                      title="تعديل"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <DeleteTemplateButton id={t.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommissionTemplatesPage;