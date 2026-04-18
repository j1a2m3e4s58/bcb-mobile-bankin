import { AppBar } from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { formatAccountNumber, formatDate, formatGHS } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useBankStore } from "@/store/bank-store";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Grid3X3,
  Plus,
  Receipt,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ──────────────────────────────────────────────────────────────

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const COUNTDOWN_SECONDS = 30;

// ─── Quick actions ───────────────────────────────────────────────────────────

const quickActions = [
  {
    label: "Send Money",
    icon: Send,
    path: "/transfers",
    ocid: "dashboard.send_money_button",
  },
  {
    label: "Pay Bills",
    icon: Receipt,
    path: "/payments",
    ocid: "dashboard.pay_bills_button",
  },
  {
    label: "Top Up",
    icon: Plus,
    path: "/transfers",
    search: "tab=mobile-money",
    ocid: "dashboard.top_up_button",
  },
  {
    label: "More",
    icon: Grid3X3,
    path: "/payments",
    ocid: "dashboard.more_button",
  },
];

// ─── Category icon background colours ────────────────────────────────────────

const categoryColors: Record<string, string> = {
  salary: "bg-success/15 text-success",
  transfer: "bg-primary/10 text-primary",
  payment: "bg-accent/15 text-accent-foreground",
  airtime: "bg-secondary/15 text-secondary-foreground",
  momo: "bg-primary/15 text-primary",
  savings: "bg-success/10 text-success",
  loan: "bg-destructive/10 text-destructive",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const transactions = useBankStore((s) => s.transactions);

  const [hideBalance, setHideBalance] = useState(false);
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleLogout = useCallback(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setShowIdleModal(false);
    logout();
    navigate({ to: "/login" });
  }, [logout, navigate]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setShowIdleModal(false);
    setCountdown(COUNTDOWN_SECONDS);

    idleTimerRef.current = setTimeout(() => {
      setShowIdleModal(true);
      setCountdown(COUNTDOWN_SECONDS);
      let remaining = COUNTDOWN_SECONDS;
      countdownTimerRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          if (countdownTimerRef.current)
            clearInterval(countdownTimerRef.current);
          handleLogout();
        }
      }, 1000);
    }, IDLE_TIMEOUT_MS);
  }, [handleLogout]);

  // Start idle tracking on mount
  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    const handler = () => resetIdleTimer();
    for (const e of events)
      window.addEventListener(e, handler, { passive: true });
    resetIdleTimer();
    return () => {
      for (const e of events) window.removeEventListener(e, handler);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [resetIdleTimer]);

  const totalBalance =
    (user?.savingsBalance ?? 0) + (user?.currentBalance ?? 0);
  const recentTxns = transactions.slice(0, 5);
  const firstName = user?.name?.split(" ")[0] ?? "Kofi";
  const accountNumber = user?.accountNumber ?? "1234567890";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* ── App Bar ── */}
      <AppBar
        showLogo
        showNotifications
        rightSlot={
          <div className="flex items-center gap-2 mr-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bcb-card-gradient flex items-center justify-center font-bold text-primary-foreground text-xs font-display flex-shrink-0">
                {user?.avatarInitials ?? "KM"}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] text-muted-foreground leading-none">
                  {greeting},
                </p>
                <p className="text-sm font-semibold text-foreground font-display leading-tight">
                  {firstName}
                </p>
              </div>
            </div>
          </div>
        }
      />

      {/* Greeting row (mobile visible) */}
      <div className="px-4 pt-4 pb-1 flex items-center justify-between sm:hidden">
        <div>
          <p className="text-xs text-muted-foreground">{greeting},</p>
          <p className="text-lg font-bold text-foreground font-display">
            {firstName} 👋
          </p>
        </div>
      </div>

      {/* ── Total Balance Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 mt-3 rounded-2xl bcb-card-gradient p-5 shadow-elevated overflow-hidden relative"
        data-ocid="dashboard.balance_card"
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary-foreground/5 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-accent/10 pointer-events-none" />

        {/* Top row */}
        <div className="flex items-start justify-between relative z-10 mb-1">
          <p className="text-primary-foreground/70 text-xs font-body">
            Total Balance
          </p>
          <button
            type="button"
            onClick={() => setHideBalance((v) => !v)}
            className="text-primary-foreground/70 hover:text-primary-foreground transition-smooth p-1 -m-1"
            aria-label={hideBalance ? "Show balance" : "Hide balance"}
            data-ocid="dashboard.toggle_balance_button"
          >
            {hideBalance ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Balance amount */}
        <motion.p
          key={hideBalance ? "hidden" : "shown"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-bold text-primary-foreground font-display mb-1 relative z-10 tracking-tight"
        >
          {hideBalance ? "GHS ••••••" : formatGHS(totalBalance)}
        </motion.p>

        {/* Account number */}
        <p className="text-[11px] text-primary-foreground/55 mb-4 relative z-10 font-mono">
          Acc: {formatAccountNumber(accountNumber)}
        </p>

        {/* Sub-account row */}
        <div className="flex gap-4 pt-4 border-t border-primary-foreground/15 relative z-10">
          <div className="flex-1">
            <p className="text-[10px] text-primary-foreground/55 mb-0.5">
              Savings Account
            </p>
            <p className="text-sm font-bold text-primary-foreground font-display">
              {hideBalance ? "GHS ••••" : formatGHS(user?.savingsBalance ?? 0)}
            </p>
          </div>
          <div className="w-px bg-primary-foreground/20 self-stretch" />
          <div className="flex-1">
            <p className="text-[10px] text-primary-foreground/55 mb-0.5">
              Current Account
            </p>
            <p className="text-sm font-bold text-primary-foreground font-display">
              {hideBalance ? "GHS ••••" : formatGHS(user?.currentBalance ?? 0)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Account Cards (Savings + Current) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 mt-3 grid grid-cols-2 gap-3"
      >
        {/* Savings */}
        <div
          className="bg-card rounded-2xl p-4 shadow-card border border-border relative overflow-hidden"
          data-ocid="dashboard.savings_card"
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-primary/5 pointer-events-none" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Savings
          </p>
          <p className="text-base font-bold text-foreground font-display leading-tight">
            {hideBalance ? "GHS ••••" : formatGHS(user?.savingsBalance ?? 0)}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-[10px] text-success font-medium">Active</span>
          </div>
        </div>

        {/* Current */}
        <div
          className="bg-card rounded-2xl p-4 shadow-card border border-border relative overflow-hidden"
          data-ocid="dashboard.current_card"
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-accent/5 pointer-events-none" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Current
          </p>
          <p className="text-base font-bold text-foreground font-display leading-tight">
            {hideBalance ? "GHS ••••" : formatGHS(user?.currentBalance ?? 0)}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] text-primary font-medium">Active</span>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 mt-4 bg-card rounded-2xl p-4 shadow-card border border-border"
      >
        <div className="grid grid-cols-4 gap-1">
          {quickActions.map(({ label, icon: Icon, path, ocid }, idx) => (
            <motion.button
              key={label}
              type="button"
              onClick={() =>
                navigate({ to: path as "/transfers" | "/payments" })
              }
              data-ocid={ocid}
              whileTap={{ scale: 0.93 }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2 + idx * 0.06,
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center gap-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <div className="w-12 h-12 rounded-2xl bcb-card-gradient flex items-center justify-center shadow-card">
                <Icon
                  className="w-5 h-5 text-primary-foreground"
                  strokeWidth={2.2}
                />
              </div>
              <span className="text-[11px] text-foreground font-medium text-center leading-tight">
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Recent Transactions ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 mt-5 mb-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground font-display">
            Recent Transactions
          </h2>
          <Link
            to="/transactions"
            className="text-xs text-primary font-semibold hover:text-primary/80 transition-smooth"
            data-ocid="dashboard.see_all_transactions_link"
          >
            See All
          </Link>
        </div>

        {/* Transaction list */}
        <div className="flex flex-col gap-2">
          {recentTxns.map((txn, idx) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.32 + idx * 0.07,
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 shadow-card border border-border"
              data-ocid={`dashboard.transaction.item.${idx + 1}`}
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0",
                  categoryColors[txn.category] ??
                    "bg-muted text-muted-foreground",
                )}
              >
                {txn.icon}
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {txn.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(txn.date)}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p
                  className={cn(
                    "text-sm font-bold font-display",
                    txn.type === "credit" ? "text-success" : "text-destructive",
                  )}
                >
                  {txn.type === "credit" ? "+" : "−"}&nbsp;
                  {formatGHS(txn.amount)}
                </p>
                <div className="flex justify-end mt-0.5">
                  {txn.type === "credit" ? (
                    <ArrowDownLeft className="w-3 h-3 text-success" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-destructive" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Idle Session Warning Modal ── */}
      <AnimatePresence>
        {showIdleModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="idle-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              data-ocid="dashboard.idle_modal_backdrop"
            />

            {/* Modal */}
            <motion.div
              key="idle-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div
                className="w-full max-w-xs bg-card rounded-2xl shadow-elevated border border-border p-6 pointer-events-auto"
                data-ocid="dashboard.idle_session_dialog"
              >
                {/* Countdown ring */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg
                      className="absolute inset-0 -rotate-90"
                      viewBox="0 0 64 64"
                      role="img"
                      aria-label="Session countdown timer"
                    >
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="oklch(var(--border))"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="oklch(var(--destructive))"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - countdown / COUNTDOWN_SECONDS)}`}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <span className="text-xl font-bold text-destructive font-display tabular-nums">
                      {countdown}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-foreground font-display text-center mb-1">
                  Session Expiring
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-5 text-balance">
                  Your session will expire in{" "}
                  <span className="font-semibold text-destructive">
                    {countdown} seconds
                  </span>{" "}
                  due to inactivity.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleLogout}
                    data-ocid="dashboard.idle_logout_button"
                  >
                    Logout
                  </Button>
                  <Button
                    className="flex-1 bcb-card-gradient text-primary-foreground border-0"
                    onClick={resetIdleTimer}
                    data-ocid="dashboard.idle_stay_button"
                  >
                    Stay Logged In
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
