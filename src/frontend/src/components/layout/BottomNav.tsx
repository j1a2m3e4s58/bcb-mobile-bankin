import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  CreditCard,
  Home,
  LayoutGrid,
  User,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Home", icon: Home, ocid: "nav.home" },
  {
    path: "/transfers",
    label: "Transfers",
    icon: ArrowLeftRight,
    ocid: "nav.transfers",
  },
  {
    path: "/payments",
    label: "Payments",
    icon: LayoutGrid,
    ocid: "nav.payments",
  },
  { path: "/cards", label: "Cards", icon: CreditCard, ocid: "nav.cards" },
  { path: "/profile", label: "More", icon: User, ocid: "nav.profile" },
] as const;

export function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-card border-t border-border shadow-elevated pb-safe">
      <div className="flex items-center justify-around h-[64px] px-2">
        {navItems.map(({ path, label, icon: Icon, ocid }) => {
          const isActive =
            currentPath === path ||
            (path !== "/dashboard" && currentPath.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              data-ocid={ocid}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-smooth",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                className={cn("w-5 h-5", isActive && "stroke-[2.5px]")}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
