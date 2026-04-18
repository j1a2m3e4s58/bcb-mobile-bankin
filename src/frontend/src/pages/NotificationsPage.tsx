import { AppBar } from "@/components/layout/AppBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelativeTime } from "@/lib/formatters";
import type { Notification } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BellOff,
  CheckCheck,
  ChevronDown,
  CreditCard,
  Info,
  Landmark,
  MessageSquare,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ─── Additional sample notifications beyond the store ─────────────────────────
const extraNotifications: Notification[] = [
  {
    id: "notif_x1",
    type: "transaction",
    title: "Money Received",
    message:
      "You received GHS 500.00 from Ama Adjei. Your account balance has been updated.",
    date: "2026-04-17",
    time: "03:12 PM",
    isRead: false,
    icon: "credit",
  },
  {
    id: "notif_x2",
    type: "security",
    title: "Unusual Login Detected",
    message:
      "Unusual login detected from a new device in Kumasi. Was this you? Tap to review your account security.",
    date: "2026-04-17",
    time: "01:47 PM",
    isRead: false,
    icon: "fraud",
  },
  {
    id: "notif_x3",
    type: "transaction",
    title: "ECG Payment Confirmed",
    message:
      "ECG electricity payment of GHS 50.00 was successful. Reference: ECG-APR-2026-7821.",
    date: "2026-04-16",
    time: "11:30 AM",
    isRead: false,
    icon: "debit",
  },
  {
    id: "notif_x4",
    type: "system",
    title: "Loan Application Approved",
    message:
      "Congratulations! Your loan application for GHS 10,000 has been approved. Funds have been disbursed to your current account.",
    date: "2026-04-16",
    time: "09:00 AM",
    isRead: false,
    icon: "bank",
  },
  {
    id: "notif_x5",
    type: "system",
    title: "Low Balance Alert",
    message:
      "Your savings account balance has fallen below GHS 500.00. Current balance: GHS 420.00. Consider topping up.",
    date: "2026-04-15",
    time: "06:00 AM",
    isRead: false,
    icon: "alert",
  },
];

type FilterTab = "all" | "transactions" | "alerts" | "bank";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "transactions", label: "Transactions" },
  { key: "alerts", label: "Alerts" },
  { key: "bank", label: "Bank Messages" },
];

// ─── Filtered subset helper ────────────────────────────────────────────────────
function filterNotifs(notifs: Notification[], tab: FilterTab): Notification[] {
  switch (tab) {
    case "transactions":
      return notifs.filter((n) => n.type === "transaction");
    case "alerts":
      return notifs.filter(
        (n) =>
          n.type === "security" ||
          n.icon === "alert" ||
          n.title.toLowerCase().includes("low balance"),
      );
    case "bank":
      return notifs.filter(
        (n) => n.type === "system" || n.type === "promotion",
      );
    default:
      return notifs;
  }
}

// ─── Colored icon per notification ────────────────────────────────────────────
function NotifIcon({ notif }: { notif: Notification }) {
  const { icon, type, message, title } = notif;

  if (icon === "fraud" || (type === "security" && icon !== "lock")) {
    return (
      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
        <ShieldAlert className="w-5 h-5 text-destructive" />
      </div>
    );
  }

  if (type === "security") {
    return (
      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
        <ShieldAlert className="w-5 h-5 text-destructive" />
      </div>
    );
  }

  if (icon === "credit") {
    return (
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <ArrowDownLeft className="w-5 h-5 text-primary" />
      </div>
    );
  }

  if (icon === "debit") {
    return (
      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
        <ArrowUpRight className="w-5 h-5 text-destructive" />
      </div>
    );
  }

  if (type === "transaction") {
    const isCreditMsg =
      message.toLowerCase().includes("received") ||
      message.toLowerCase().includes("credited") ||
      message.toLowerCase().includes("interest") ||
      title.toLowerCase().includes("received") ||
      title.toLowerCase().includes("salary") ||
      title.toLowerCase().includes("interest");

    return isCreditMsg ? (
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <ArrowDownLeft className="w-5 h-5 text-primary" />
      </div>
    ) : (
      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
        <ArrowUpRight className="w-5 h-5 text-destructive" />
      </div>
    );
  }

  if (icon === "bank" || title.toLowerCase().includes("loan")) {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
        <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (icon === "alert" || title.toLowerCase().includes("low balance")) {
    return (
      <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-accent" />
      </div>
    );
  }

  if (type === "promotion") {
    return (
      <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
        <Zap className="w-5 h-5 text-accent" />
      </div>
    );
  }

  if (type === "system") {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
      <CreditCard className="w-5 h-5 text-muted-foreground" />
    </div>
  );
}

// ─── Type badge chip ───────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: Notification["type"] }) {
  const map: Record<
    Notification["type"],
    { cls: string; label: string; icon: React.ReactNode }
  > = {
    transaction: {
      cls: "bg-primary/10 text-primary border-primary/20",
      label: "Transaction",
      icon: <CreditCard className="w-3 h-3" />,
    },
    security: {
      cls: "bg-destructive/10 text-destructive border-destructive/20",
      label: "Security",
      icon: <ShieldAlert className="w-3 h-3" />,
    },
    promotion: {
      cls: "bg-accent/15 text-accent-foreground border-accent/30",
      label: "Offer",
      icon: <Zap className="w-3 h-3" />,
    },
    system: {
      cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      label: "Bank",
      icon: <MessageSquare className="w-3 h-3" />,
    },
  };
  const { cls, label, icon } = map[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
        cls,
      )}
    >
      {icon}
      {label}
    </span>
  );
}

// ─── Single notification card ──────────────────────────────────────────────────
function NotificationItem({
  notif,
  index,
  isExpanded,
  onToggle,
}: {
  notif: Notification;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const markRead = useBankStore((s) => s.markNotificationRead);

  function handleClick() {
    if (!notif.isRead) markRead(notif.id);
    onToggle();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.035,
        duration: 0.26,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        "relative rounded-2xl overflow-hidden transition-smooth shadow-card hover:shadow-elevated",
        !notif.isRead
          ? "bg-primary/5 dark:bg-primary/8 ring-1 ring-primary/20"
          : "bg-card",
      )}
      data-ocid={`notifications.item.${index + 1}`}
    >
      {/* Unread accent bar */}
      {!notif.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-primary" />
      )}

      <button
        type="button"
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
        onClick={handleClick}
        aria-expanded={isExpanded}
        aria-label={notif.title}
      >
        <NotifIcon notif={notif} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <p
              className={cn(
                "text-sm font-semibold leading-snug flex-1 min-w-0",
                !notif.isRead ? "text-foreground" : "text-foreground/80",
              )}
            >
              {notif.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              {!notif.isRead && (
                <span
                  className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                  aria-label="Unread"
                />
              )}
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180",
                )}
              />
            </div>
          </div>

          <p
            className={cn(
              "text-xs text-muted-foreground leading-relaxed",
              !isExpanded && "line-clamp-2",
            )}
          >
            {notif.message}
          </p>

          <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">
            {formatRelativeTime(notif.date)} · {notif.time}
          </p>
        </div>
      </button>

      {/* Expand-in-place detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 mx-4 pt-3 pb-4 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>
                  <span className="text-foreground/60 font-medium">Date: </span>
                  {formatDate(notif.date)} at {notif.time}
                </p>
                <p className="capitalize">
                  <span className="text-foreground/60 font-medium">
                    Category:{" "}
                  </span>
                  {notif.type}
                </p>
              </div>
              <TypeBadge type={notif.type} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty state illustration ──────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 px-8 gap-4 text-center"
      data-ocid="notifications.empty_state"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        <BellOff className="w-9 h-9 text-muted-foreground/40" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-semibold text-foreground">
          You're all caught up!
        </p>
        <p className="text-sm text-muted-foreground max-w-[230px]">
          No notifications here. We'll alert you when something needs attention.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const {
    notifications: storeNotifs,
    unreadCount,
    markAllRead,
  } = useBankStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Merge store notifications with extra sample data (deduplicate by id)
  const storeIdSet = new Set(storeNotifs.map((n) => n.id));
  const allNotifs: Notification[] = [
    ...extraNotifications.filter((n) => !storeIdSet.has(n.id)),
    ...storeNotifs,
  ].sort((a, b) => {
    const tA = new Date(`${a.date}T${a.time}`).getTime();
    const tB = new Date(`${b.date}T${b.time}`).getTime();
    const diff = tB - tA;
    return Number.isNaN(diff) ? 0 : diff;
  });

  const filtered = filterNotifs(allNotifs, activeTab);
  const filteredUnread = filtered.filter((n) => !n.isRead).length;

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* App Bar */}
      <AppBar
        title="Notifications"
        showBack
        showNotifications={false}
        rightSlot={
          unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              data-ocid="notifications.mark_all_read_button"
              className="flex items-center gap-1.5 text-xs text-primary font-semibold h-8 px-2 hover:bg-primary/10 hover:text-primary"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs — sticky below AppBar */}
      <div className="sticky top-14 z-30 bg-card border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const tabUnread =
              tab.key === "all"
                ? allNotifs.filter((n) => !n.isRead).length
                : filterNotifs(allNotifs, tab.key).filter((n) => !n.isRead)
                    .length;

            return (
              <button
                key={tab.key}
                type="button"
                data-ocid={`notifications.filter.${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-3.5 text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {tabUnread > 0 && (
                  <span
                    className={cn(
                      "flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tabUnread > 9 ? "9+" : tabUnread}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="notif-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {/* Unread summary */}
        {filteredUnread > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-3"
          >
            <Badge className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
              {filteredUnread} unread
            </Badge>
            <span className="text-xs text-muted-foreground">
              {activeTab === "all"
                ? "new notifications"
                : `in ${TABS.find((t) => t.key === activeTab)?.label ?? ""}`}
            </span>
          </motion.div>
        )}

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((notif, idx) => (
                <NotificationItem
                  key={notif.id}
                  notif={notif}
                  index={idx}
                  isExpanded={expandedId === notif.id}
                  onToggle={() => handleToggle(notif.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
