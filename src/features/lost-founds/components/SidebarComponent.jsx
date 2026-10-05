import { NavLink } from "react-router-dom";
import {
  IconChartBar,
  IconClipboardList,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

export const MENUS = [
  { to: "/", label: "Dashboard", icon: IconClipboardList, end: true },
  { to: "/?view=stats", label: "Statistik", icon: IconChartBar, end: false },
  { to: "/users", label: "Pengguna", icon: IconUsers, end: false },
  { to: "/profile", label: "Profil Saya", icon: IconUser, end: false },
];

function SidebarComponent({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          data-testid="sidebar-overlay"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}
      <aside
        data-testid="sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white p-4 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="font-bold">Menu</span>
          <button type="button" aria-label="Tutup menu" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>
        <nav className="space-y-1">
          {MENUS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default SidebarComponent;
