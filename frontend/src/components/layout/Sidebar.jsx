import {
  LayoutDashboard,
  CreditCard,
  WalletCards,
  BarChart3,
  FileText,
  Receipt,
  CheckSquare,
  PlusCircle,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const employeeLinks = [
  {
    name: "Dashboard",
    path: "/employee",
    icon: LayoutDashboard,
  },
  {
    name: "My Claims",
    path: "/employee/claims",
    icon: Receipt,
  },
  {
    name: "New Claim",
    path: "/employee/claims/new",
    icon: PlusCircle,
  },
];

const managerLinks = [
  {
    name: "Dashboard",
    path: "/manager",
    icon: LayoutDashboard,
  },
  {
    name: "Approvals",
    path: "/manager/approvals",
    icon: CheckSquare,
  },
  {
    name: "My Claims",
    path: "/employee/claims",
    icon: Receipt,
  },
  {
    name: "New Claim",
    path: "/employee/claims/new",
    icon: PlusCircle,
  },
];

const financeLinks = [
  {
    name: "Dashboard",
    path: "/finance",
    icon: LayoutDashboard,
  },
  {
    name: "Ready to Pay",
    path: "/finance/ready-to-pay",
    icon: CreditCard,
  },
  {
    name: "Payments",
    path: "/finance/payments",
    icon: WalletCards,
  },
  {
    name: "Analytics",
    path: "/finance/analytics",
    icon: BarChart3,
  },
  {
    name: "Budgets",
    path: "/finance/budgets",
    icon: FileText,
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const role = user?.role;

  let links = [];
  let departmentLabel = "Expense Management";

  if (role === "EMPLOYEE") {
    links = employeeLinks;
    departmentLabel = "Employee Portal";
  } else if (role === "MANAGER") {
    links = managerLinks;
    departmentLabel = "Manager Portal";
  } else if (role === "FINANCE") {
    links = financeLinks;
    departmentLabel = "Finance Department";
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800 text-white">

      {/* Logo */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl font-bold shadow-sm">
            C
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              ClaimFlow
            </h1>

            <p className="text-xs text-indigo-200">
              Smart Expense Management
            </p>
          </div>
        </div>

        <p className="mt-7 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          {departmentLabel}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-4">

        {/* User information */}
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 font-semibold">
            {user?.full_name
              ? user.full_name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.full_name || user?.username || "User"}
            </p>

            <p className="truncate text-xs text-indigo-200">
              {user?.email || ""}
            </p>

            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
              {user?.role || ""}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-indigo-200 transition-all duration-200 hover:bg-red-500/15 hover:text-white active:scale-[0.98]"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
