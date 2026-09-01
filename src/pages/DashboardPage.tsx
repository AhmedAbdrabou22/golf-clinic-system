import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { NAV_LINKS } from "@/utils/constants";
import PageHeader from "@/components/shared/PageHeader";

const GROUPS: { key: "clinic" | "inventory" | "admin"; label: string; hint: string }[] = [
  { key: "clinic", label: "العيادة", hint: "المرضى، الحجوزات، الفواتير والشفتات" },
  { key: "inventory", label: "المخازن والمشتريات", hint: "الموردين، الأصناف وفواتير الشراء" },
  { key: "admin", label: "الإدارة والإعدادات", hint: "الأقسام، الخدمات، الموظفين والصلاحيات" },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء الخير";

  return (
    <div>
      <PageHeader
        title={`${greeting}${user?.name ? "، " + user.name : ""} 👋`}
        subtitle="اختر القسم الذي تريد العمل عليه من الروابط السريعة بالأسفل"
      />

      <div className="flex flex-col gap-8">
        {GROUPS.map((group) => (
          <section key={group.key}>
            <div className="mb-3">
              <h2 className="font-display text-base font-bold text-ink">{group.label}</h2>
              <p className="text-sm text-ink/45">{group.hint}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {NAV_LINKS.filter((l) => l.group === group.key && l.to !== "/").map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="card group flex flex-col items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-100 text-primary-600 transition group-hover:bg-primary-500 group-hover:text-white">
                    <link.icon size={18} />
                  </span>
                  <span className="font-bold text-ink/85">{link.label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
