import {
  LayoutDashboard,
  CreditCard,
  WalletCards,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Receipt,
  ClipboardCheck,
  PlusCircle,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
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
    name: "My Claims",
    path: "/employee/claims",
    icon: Receipt,
  },
  {
    name: "New Claim",
    path: "/employee/claims/new",
    icon: PlusCircle,
  },
  {
    name: "Approvals",
    path: "/manager/approvals",
    icon: ClipboardCheck,
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
  const navigate = useNavigate();

  let links = [];
  let department = "Employee Department";

  if (user?.role === "FINANCE") {
    links = financeLinks;
    department = "Finance Department";
  } else if (user?.role === "MANAGER") {
    links = managerLinks;
    department = "Manager Department";
  } else {
    links = employeeLinks;
    department = "Employee Department";
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-700 text-white">

      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl font-bold">
            C
          </div>

          <div>
            <h1 className="text-lg font-bold">
              ClaimFlow
            </h1>

            <p className="text-xs text-indigo-200">
              Expense Management
            </p>
          </div>

        </div>

        <p className="mt-8 text-xs uppercase tracking-wider text-indigo-200">
          {department}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4">

        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5" />

              <span>
                {link.name}
              </span>
            </NavLink>
          );
        })}

      </nav>

      {/* Bottom section */}
      <div className="space-y-2 border-t border-white/10 p-4">

        {/* Settings */}
        <button
          type="button"
          onClick={() => {
            console.log("Settings clicked");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-indigo-200 transition hover:bg-white/10 hover:text-white"
        >
          <Settings className="h-5 w-5" />

          <span>
            Settings
          </span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 active:scale-[0.98]"
        >
          <LogOut className="h-5 w-5" />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}
