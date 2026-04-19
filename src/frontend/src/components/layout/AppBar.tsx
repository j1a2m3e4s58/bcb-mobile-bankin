import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell } from "lucide-react";

interface AppBarProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showLogo?: boolean;
  className?: string;
  rightSlot?: React.ReactNode;
}

export function AppBar({
  title,
  showBack = false,
  showNotifications = true,
  showLogo = false,
  className,
  rightSlot,
}: AppBarProps) {
  const navigate = useNavigate();
  const unreadCount = useBankStore((s) => s.unreadCount);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-card border-b border-border",
        className,
      )}
    >
      {/* Left slot */}
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            type="button"
            data-ocid="appbar.back_button"
            onClick={handleBack}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-smooth"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
        )}
        {showLogo && (
          <img
            src="/assets/bcb-logo.png"
            alt="BCB Logo"
            className="w-7 h-7 object-contain"
          />
        )}
        {title && (
          <h1 className="text-base font-semibold text-foreground font-display truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right slot */}
      <div className="flex items-center gap-2">
        {rightSlot}
        {showNotifications && (
          <Link
            to="/notifications"
            data-ocid="appbar.notifications_button"
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-muted/80 transition-smooth"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
