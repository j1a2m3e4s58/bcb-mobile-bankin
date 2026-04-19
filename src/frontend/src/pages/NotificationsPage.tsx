import { AppBar } from "@/components/layout/AppBar";
import { ActivityIconGlyph } from "@/lib/activity-icons";
import { formatDate, formatRelativeTime } from "@/lib/formatters";
import type { Notification } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import { BellOff, CheckCheck, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type FilterTab = "all" | "transactions" | "alerts" | "bank";

const EXTRA_NOTIFICATIONS: Notification[] = [
  {
    id: "notif_extra_1",
    type: "transaction",
    title: "Money Received",
    message: "You received GHS 500.00 from Ama Adjei. Your account balance has been updated.",
    date: "2026-04-17",
    time: "03:12 PM",
    isRead: false,
    icon: "arrow-down-left",
  },
  {
    id: "notif_extra_2",
    type: "security",
    title: "Unusual Login Detected",
    message: "Unusual login detected from a new device in Kumasi. Review your account security.",
    date: "2026-04-17",
    time: "01:47 PM",
    isRead: false,
    icon: "shield-alert",
  },
];

function matchesTab(notification: Notification, tab: FilterTab) {
  if (tab === "all") return true;
  if (tab === "transactions") return notification.type === "transaction";
  if (tab === "alerts") return notification.type === "security";
  return notification.type === "system" || notification.type === "promotion";
}

function NotificationItem({
  notification,
  expanded,
  onToggle,
}: {
  notification: Notification;
  expanded: boolean;
  onToggle: () => void;
}) {
  const markRead = useBankStore((state) => state.markNotificationRead);

  return (
    <motion.div layout className="overflow-hidden rounded-2xl bg-card shadow-card">
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-4 text-left"
        onClick={() => {
          if (!notification.isRead) markRead(notification.id);
          onToggle();
        }}
      >
        <div
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
            notification.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
          )}
        >
          <ActivityIconGlyph icon={notification.icon} className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn("text-sm font-semibold", !notification.isRead && "text-foreground")}>
                {notification.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {notification.message}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            {formatRelativeTime(notification.date)} | {notification.time}
          </p>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/60 px-4 py-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatDate(notification.date)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium capitalize">{notification.type}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead } = useBankStore();
  const [tab, setTab] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const merged = useMemo(() => {
    const ids = new Set(notifications.map((item) => item.id));
    return [...EXTRA_NOTIFICATIONS.filter((item) => !ids.has(item.id)), ...notifications].sort((a, b) =>
      `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`),
    );
  }, [notifications]);

  const filtered = merged.filter((notification) => matchesTab(notification, tab));

  return (
    <div className="flex min-h-full flex-col bg-background">
      <AppBar
        title="Notifications"
        showBack
        showNotifications={false}
        rightSlot={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="mr-2 flex items-center gap-1 text-xs font-semibold text-primary"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="sticky top-14 z-20 border-b border-border bg-card px-2">
        <div className="flex gap-1 overflow-x-auto py-2">
          {(["all", "transactions", "alerts", "bank"] as FilterTab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-smooth",
                tab === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {item === "bank" ? "Bank Messages" : item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BellOff className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold">You're all caught up</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              No notifications match this filter right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                expanded={expandedId === notification.id}
                onToggle={() => setExpandedId((current) => (current === notification.id ? null : notification.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
