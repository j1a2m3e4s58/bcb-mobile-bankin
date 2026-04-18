import { Outlet } from "@tanstack/react-router";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="flex items-start justify-center min-h-dvh desktop-bg">
      <div className="mobile-frame bg-background flex flex-col shadow-elevated relative">
        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto pb-[80px]">
          <Outlet />
        </main>
        {/* Fixed bottom nav */}
        <BottomNav />
      </div>
    </div>
  );
}
