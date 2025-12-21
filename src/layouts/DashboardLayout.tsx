import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
