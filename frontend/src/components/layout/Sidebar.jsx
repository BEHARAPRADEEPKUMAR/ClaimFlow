import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  ClipboardCheck,
  ShieldCheck,
  CreditCard,
  WalletCards,
  BarChart3,
  FileText,
  X,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


export default function Sidebar({
  open = false,
  onClose,
}) {

  const location = useLocation();

  const navigate = useNavigate();

  const { user } = useAuth();


  const financeLinks = [
    {
      name: "Dashboard",
      path: "/finance",
      icon: LayoutDashboard,
    },
    {
      name: "Manager Claims",
      path: "/finance/manager-claims",
      icon: ShieldCheck,
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
      name: "Create Claim",
      path: "/employee/claims/new",
      icon: PlusCircle,
    },
    {
      name: "Approval Queue",
      path: "/manager/approvals",
      icon: ClipboardCheck,
    },
  ];


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
      name: "Create Claim",
      path: "/employee/claims/new",
      icon: PlusCircle,
    },
  ];


  let links = employeeLinks;


  if (user?.role === "MANAGER") {
    links = managerLinks;
  }

  if (user?.role === "FINANCE") {
    links = financeLinks;
  }


  const isActive = (path) => {

    if (path === "/employee") {
      return location.pathname === "/employee";
    }

    if (path === "/manager") {
      return location.pathname === "/manager";
    }

    if (path === "/finance") {
      return location.pathname === "/finance";
    }

    return location.pathname.startsWith(path);
  };


  const handleNavigate = (path) => {

    navigate(path);

    if (onClose) {
      onClose();
    }

  };


  return (

    <>

      {/* Mobile Overlay */}

      {open && (

        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />

      )}


      {/* Sidebar */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-slate-200
          bg-white
          transition-transform duration-200
          lg:translate-x-0
          ${open
            ? "translate-x-0"
            : "-translate-x-full"}
        `}
      >

        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">

          <button
            onClick={() =>
              handleNavigate(
                user?.role === "FINANCE"
                  ? "/finance"
                  : user?.role === "MANAGER"
                    ? "/manager"
                    : "/employee"
              )
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">

              <Receipt size={20} />

            </div>


            <div className="text-left">

              <p className="text-lg font-bold tracking-tight text-slate-900">

                ClaimFlow

              </p>

              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">

                Smart Expenses

              </p>

            </div>

          </button>


          {/* Mobile Close */}

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >

            <X size={20} />

          </button>

        </div>


        {/* Workspace */}

        <div className="px-4 pt-5">

          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">

            Workspace

          </p>


          <nav className="mt-3 space-y-1">

            {links.map((link) => {

              const Icon = link.icon;

              const active =
                isActive(link.path);


              return (

                <button
                  key={link.path}
                  onClick={() =>
                    handleNavigate(link.path)
                  }
                  className={`
                    group flex w-full items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-sm font-medium
                    transition
                    ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >

                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-700"
                    }
                  />

                  <span>
                    {link.name}
                  </span>

                </button>

              );

            })}

          </nav>

        </div>


        {/* Bottom */}

        <div className="mt-auto border-t border-slate-100 p-4">

          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-semibold text-slate-700">

              {user?.role === "FINANCE"
                ? "Finance Workspace"
                : user?.role === "MANAGER"
                  ? "Management Workspace"
                  : "Employee Workspace"}

            </p>


            <p className="mt-1 text-[11px] leading-5 text-slate-400">

              Manage claims, approvals and expenses securely.

            </p>

          </div>

        </div>

      </aside>

    </>

  );
}