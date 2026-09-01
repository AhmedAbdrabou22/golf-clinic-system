import useFetch from "@/hooks/useFetch";
import PageHeader from "@/components/shared/PageHeader";
import SettingsList from "@/components/settings/SettingsList";
import type { Setting } from "@/types";

const SettingsPage = () => {
  const { data, isLoading } = useFetch<{ data: Setting[] }>({
    queryKey: ["settings"],
    endpoint: "settings",
  });
  const settings = data?.data ?? (Array.isArray(data) ? (data as any) : []);

  return (
    <div>
      <PageHeader title="الإعدادات" subtitle="ضبط الإعدادات العامة لنظام العيادة" />
      <SettingsList settings={settings} isLoading={isLoading} />
    </div>
  );
};

export default SettingsPage;
