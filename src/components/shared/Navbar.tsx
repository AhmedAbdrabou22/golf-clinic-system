import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiChevronDown, FiLogOut, FiMenu, FiX, FiUser } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { NAV_LINKS } from "@/utils/constants";
import { STAFF_TYPES } from "@/utils/constants";

const GROUPS: { key: "clinic" | "inventory" | "admin"; label: string }[] = [
  { key: "clinic", label: "العيادة" },
  { key: "inventory", label: "المخازن والمشتريات" },
  { key: "admin", label: "الإدارة" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const staffTypeLabel = STAFF_TYPES.find((t) => t.value === user?.type)?.label;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* الشعار */}
        <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 font-display text-lg font-extrabold text-white">
            س
          </span>
          <span className="hidden font-display text-lg font-extrabold text-ink sm:block">
            الجولف كلينك
          </span>
        </NavLink>

        {/* التنقل - Desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          {GROUPS.map((group) => {
            const links = NAV_LINKS.filter((l) => l.group === group.key);
            return (
              <div
                key={group.key}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.key)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-ink/70 transition hover:bg-mint-100 hover:text-primary-600"
                >
                  {group.label}
                  <FiChevronDown size={15} />
                </button>
                {openGroup === group.key && (
                  <div className="absolute start-0 top-full w-56 rounded-xl border border-ink/10 bg-white p-1.5 shadow-soft">
                    {links.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold transition ${
                            isActive
                              ? "bg-primary-50 text-primary-600"
                              : "text-ink/70 hover:bg-mint-100"
                          }`
                        }
                      >
                        <link.icon size={16} />
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* المستخدم */}
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-ink/10 py-1.5 pe-1.5 ps-3 text-sm font-bold text-ink/80 transition hover:bg-mint-100"
            >
              <span className="hidden text-start md:block">
                <span className="block leading-tight">{user?.name ?? "مستخدم"}</span>
                <span className="block text-[11px] font-medium text-ink/40">
                  {staffTypeLabel}
                </span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <FiUser size={16} />
              </span>
            </button>
            {userMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-ink/10 bg-white p-1.5 shadow-soft">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold text-coral-600 transition hover:bg-coral-500/10"
                >
                  <FiLogOut size={16} />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-ink/70 hover:bg-mint-100 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="القائمة"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* التنقل - Mobile */}
      {mobileOpen && (
        <nav className="border-t border-ink/10 bg-white px-4 py-3 lg:hidden">
          {GROUPS.map((group) => (
            <div key={group.key} className="mb-3 last:mb-0">
              <p className="mb-1.5 px-1 text-xs font-extrabold text-ink/35">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {NAV_LINKS.filter((l) => l.group === group.key).map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold ${
                        isActive ? "bg-primary-50 text-primary-600" : "text-ink/70"
                      }`
                    }
                  >
                    <link.icon size={17} />
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold text-coral-600"
          >
            <FiLogOut size={17} />
            تسجيل الخروج
          </button>
        </nav>
      )}

      {/* خط النبض - العنصر المميز للهوية البصرية */}
      <svg
        className="pulse-line"
        viewBox="0 0 1200 34"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 17 H430 L455 4 L478 30 L500 10 L520 17 H770 L795 4 L818 30 L840 10 L860 17 H1200"
          fill="none"
          stroke="#0F6E5F"
          strokeOpacity="0.18"
          strokeWidth="2"
        />
      </svg>
    </header>
  );
};

export default Navbar;
