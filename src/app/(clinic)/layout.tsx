import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { TopNavbar } from "@/components/top-navbar";

export default function ClinicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />

        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}