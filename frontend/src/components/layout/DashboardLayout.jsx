import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";


export default function DashboardLayout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (

    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />


      {/* Main Content */}

      <div className="min-h-screen lg:ml-64">

        <Topbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />


        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">

          {children}

        </main>

      </div>

    </div>

  );
}