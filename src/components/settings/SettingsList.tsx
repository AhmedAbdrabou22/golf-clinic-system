import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";
import SettingFormModal from "./SettingFormModal";
import type { Setting } from "@/types";

interface Props {
  settings: Setting[];
  isLoading: boolean;
}

const SettingsList = ({ settings, isLoading }: Props) => {
  const [selected, setSelected] = useState<Setting | null>(null);

  if (isLoading) return <Loader label="جاري تحميل الإعدادات..." />;
  if (!settings || settings.length === 0)
    return <EmptyState title="لا توجد إعدادات" hint="سيتم عرض إعدادات النظام هنا." />;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {settings.map((s) => (
          <div key={s.id} className="card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-ink/40">{s.key ?? s.name ?? `#${s.id}`}</p>
              <p className="mt-1 truncate font-bold text-ink">{s.value}</p>
            </div>
            <button
              onClick={() => setSelected(s)}
              className="shrink-0 rounded-lg p-2 text-primary-600 hover:bg-primary-50"
              aria-label="تعديل"
            >
              <FiEdit2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <SettingFormModal open={!!selected} onClose={() => setSelected(null)} setting={selected} />
    </>
  );
};

export default SettingsList;
