import {
  Menu,
  Bell,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";


export default function Topbar({
  onMenuClick,
}) {

  const { user } = useAuth();


  const getWorkspaceName = () => {

    if (user?.role === "FINANCE") {
      return "Finance Department";
    }

    if (user?.role === "MANAGER") {
      return "Management";
    }

    return "Employee Workspace";
  };


  const getInitials = () => {

    const name =
      user?.full_name ||
      user?.username ||
      "User";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase()
      )
      .join("");
  };


  const today = new Date();


  const formattedDate =
    today.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );


  return (

    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">

      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">


        {/* LEFT */}

        <div className="flex items-center gap-3">

          {/* Mobile Menu */}

          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >

            <Menu size={21} />

          </button>


          <div>

            <p className="text-sm font-semibold text-slate-900">

              {getWorkspaceName()}

            </p>

            <p className="hidden text-xs text-slate-400 sm:block">

              {formattedDate}

            </p>

          </div>

        </div>


        {/* RIGHT */}

        <div className="flex items-center gap-2 sm:gap-4">


          {/* Notification */}

          <button
            className="relative rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Notifications"
          >

            <Bell size={19} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />

          </button>


          {/* Divider */}

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />


          {/* User */}

          <div className="flex items-center gap-2 sm:gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">

              {getInitials()}

            </div>


            <div className="hidden text-left sm:block">

              <p className="max-w-[160px] truncate text-sm font-semibold text-slate-800">

                {user?.full_name ||
                  user?.username ||
                  "User"}

              </p>

              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">

                {user?.role || "USER"}

              </p>

            </div>


            <ChevronDown
              size={16}
              className="hidden text-slate-400 sm:block"
            />

          </div>

        </div>

      </div>

    </header>

  );
}