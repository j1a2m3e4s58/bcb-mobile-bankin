import { AppBar } from "@/components/layout/AppBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatGHS } from "@/lib/formatters";
import type { BankCard } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Plus,
  ShieldAlert,
  SlidersHorizontal,
  Snowflake,
  Unlock,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Virtual Card ──────────────────────────────────────────────────────────

function VirtualCard({
  card,
  isSelected,
  onSelect,
  index,
}: {
  card: BankCard;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const displayNumber =
    card.network === "visa" ? "•••• •••• •••• 4521" : "•••• •••• •••• 8847";
  const displayExpiry = card.network === "visa" ? "12/27" : "08/26";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      data-ocid={`cards.card.${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index - 1) * 0.12 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative flex-shrink-0 w-[320px] rounded-3xl overflow-hidden text-left focus-visible:outline-none",
        "transition-smooth shadow-elevated",
        isSelected
          ? "ring-2 ring-accent ring-offset-4 ring-offset-background"
          : "opacity-90",
      )}
      style={{ aspectRatio: "1.586" }}
      aria-label={`${card.network} ${card.type} card`}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.34 0.13 148) 0%, oklch(0.46 0.14 148) 45%, oklch(0.58 0.12 145) 72%, oklch(0.66 0.15 70) 100%)",
        }}
      />
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/[0.05]" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-white/[0.04]" />
      <div className="absolute top-1/3 right-5 w-14 h-14 rounded-full border border-white/10" />

      {/* EMV Chip */}
      <div
        className="absolute rounded-md opacity-80"
        style={{
          top: "42%",
          left: "5.5%",
          width: "32px",
          height: "24px",
          background:
            "linear-gradient(135deg, #e8c97a 0%, #c8a84b 50%, #e8c97a 100%)",
          boxShadow: "inset 0 0 4px rgba(0,0,0,0.2)",
        }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-5">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/bcb-logo.png"
              alt="BCB"
              className="w-8 h-8 object-contain drop-shadow"
            />
            <div>
              <p className="text-[9px] text-white/55 uppercase tracking-widest font-bold leading-none">
                BCB
              </p>
              <p className="text-[9px] text-white/65 uppercase tracking-wide capitalize">
                {card.type}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] uppercase font-bold px-2 py-0.5",
              card.isFrozen
                ? "bg-blue-900/40 border-blue-400/40 text-blue-200"
                : "bg-white/10 border-white/25 text-white/80",
            )}
          >
            {card.isFrozen ? "Frozen" : "Active"}
          </Badge>
        </div>

        {/* Card number */}
        <p className="text-white/88 text-sm font-mono tracking-[0.2em] mt-auto px-0.5">
          {displayNumber}
        </p>

        {/* Bottom row */}
        <div className="flex items-end justify-between mt-2">
          <div>
            <p className="text-[9px] text-white/48 uppercase tracking-widest">
              Card Holder
            </p>
            <p className="text-[11px] font-bold text-white tracking-wider">
              {card.cardHolder}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-white/48 uppercase tracking-widest">
              Expires
            </p>
            <p className="text-[11px] font-bold text-white">{displayExpiry}</p>
          </div>
          {/* Network mark */}
          {card.network === "visa" ? (
            <span className="text-white font-black text-xl tracking-tight italic drop-shadow-sm">
              VISA
            </span>
          ) : (
            <div className="flex items-center">
              <div
                className="w-6 h-6 rounded-full"
                style={{ background: "rgba(220,50,50,0.85)" }}
              />
              <div
                className="w-6 h-6 rounded-full -ml-3"
                style={{ background: "rgba(245,180,0,0.85)" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Frozen overlay */}
      <AnimatePresence>
        {card.isFrozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{
              background: "rgba(8,22,40,0.58)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-blue-400/30 bg-blue-900/50">
              <Snowflake className="w-6 h-6 text-blue-300" />
            </div>
            <span className="text-white font-extrabold tracking-[0.3em] text-sm uppercase drop-shadow">
              FROZEN
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Monthly Spend Bar ─────────────────────────────────────────────────────

function SpendingBar({ card }: { card: BankCard }) {
  const monthlySpent = card.network === "visa" ? 2340 : 680;
  const monthlyLimit = card.spendingLimit;
  const pct = Math.min((monthlySpent / monthlyLimit) * 100, 100);
  const isWarm = pct >= 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="bg-card rounded-2xl px-4 py-3.5 shadow-card"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">
          Monthly Spend
        </span>
        <span
          className={cn(
            "text-xs font-bold tabular-nums",
            isWarm ? "text-accent" : "text-primary",
          )}
        >
          {Math.round(pct)}% used
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-2">
        <motion.div
          className={cn(
            "h-full rounded-full",
            isWarm ? "bg-accent" : "bg-primary",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span className="font-medium">{formatGHS(monthlySpent)} spent</span>
        <span>of {formatGHS(monthlyLimit)} limit</span>
      </div>
    </motion.div>
  );
}

// ─── Spending Limit Dialog ─────────────────────────────────────────────────

function SpendingLimitDialog({
  card,
  open,
  onClose,
}: { card: BankCard; open: boolean; onClose: () => void }) {
  const { setSpendingLimit } = useBankStore();
  const [daily, setDaily] = useState(card.spendingLimit);
  const [monthly, setMonthly] = useState(card.spendingLimit * 6);

  const handleSave = () => {
    setSpendingLimit(card.id, daily);
    toast.success("Spending Limits Updated", {
      description: `Daily: ${formatGHS(daily)} · Monthly: ${formatGHS(monthly)}`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-ocid="cards.limit_dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            Set Spending Limits
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Adjust daily and monthly transaction limits for this card.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Daily Limit */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Daily Limit</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">GHS</span>
                <Input
                  type="number"
                  className="w-24 h-8 text-sm text-right font-display font-bold"
                  value={daily}
                  min={100}
                  max={50000}
                  onChange={(e) => setDaily(Number(e.target.value))}
                  data-ocid="cards.daily_limit_input"
                />
              </div>
            </div>
            <Slider
              value={[daily]}
              min={100}
              max={20000}
              step={100}
              onValueChange={([v]) => setDaily(v)}
              data-ocid="cards.daily_limit_slider"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>GHS 100</span>
              <span>GHS 20,000</span>
            </div>
          </div>

          <Separator />

          {/* Monthly Limit */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Monthly Limit</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">GHS</span>
                <Input
                  type="number"
                  className="w-24 h-8 text-sm text-right font-display font-bold"
                  value={monthly}
                  min={500}
                  max={200000}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  data-ocid="cards.monthly_limit_input"
                />
              </div>
            </div>
            <Slider
              value={[monthly]}
              min={500}
              max={100000}
              step={500}
              onValueChange={([v]) => setMonthly(v)}
              data-ocid="cards.monthly_limit_slider"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>GHS 500</span>
              <span>GHS 100,000</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="cards.limit_cancel_button"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-ocid="cards.limit_confirm_button">
            Save Limits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Report Lost Dialog ────────────────────────────────────────────────────

function ReportLostDialog({
  card,
  open,
  onClose,
}: { card: BankCard; open: boolean; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const tail = card.network === "visa" ? "4521" : "8847";

  const handleReport = () => {
    setDone(true);
    setTimeout(() => {
      toast.success("Card Reported", {
        description:
          "A replacement card will be issued within 5–7 business days.",
      });
      setDone(false);
      setConfirmed(false);
      onClose();
    }, 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-ocid="cards.report_dialog">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle className="font-display text-destructive">
              Report Lost / Stolen
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            This will immediately block card ending{" "}
            <strong>••••&nbsp;{tail}</strong> and freeze all transactions. A
            replacement will be issued automatically.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="w-12 h-12 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Card Blocked Successfully
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <Checkbox
                id="report-confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(!!v)}
                data-ocid="cards.report_confirm_checkbox"
              />
              <Label
                htmlFor="report-confirm"
                className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
              >
                I confirm this card has been lost or stolen and authorise BCB to
                block it immediately.
              </Label>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                data-ocid="cards.report_cancel_button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!confirmed}
                onClick={handleReport}
                data-ocid="cards.report_submit_button"
              >
                Report Card
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Request Card Dialog ───────────────────────────────────────────────────

function RequestCardDialog({
  cardType,
  open,
  onClose,
}: { cardType: "debit" | "credit"; open: boolean; onClose: () => void }) {
  const [address, setAddress] = useState("");
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setSubmitted(false);
    setAddress("");
    setIdentityConfirmed(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm" data-ocid="cards.request_dialog">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-display capitalize">
              Request {cardType} Card
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Fill in your details to request a new BCB {cardType} card.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-5 text-center"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1.5">
              <p className="font-bold text-foreground font-display">
                Request Submitted!
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your card request has been submitted. Allow 5–7 business days.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full"
              data-ocid="cards.request_done_button"
            >
              Done
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4 py-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Card Type
                </Label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-input bg-muted/40">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {cardType} Card (Visa)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="delivery-address"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Delivery Address
                </Label>
                <Input
                  id="delivery-address"
                  placeholder="e.g. House 12, Bawjiase Road, Central Region"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl"
                  data-ocid="cards.request_address_input"
                />
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <Checkbox
                  id="identity-confirm"
                  checked={identityConfirmed}
                  onCheckedChange={(v) => setIdentityConfirmed(!!v)}
                  data-ocid="cards.request_identity_checkbox"
                />
                <Label
                  htmlFor="identity-confirm"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I confirm my identity as a verified BCB account holder and
                  agree to card issuance terms.
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                data-ocid="cards.request_cancel_button"
              >
                Cancel
              </Button>
              <Button
                disabled={!address.trim() || !identityConfirmed}
                onClick={() => setSubmitted(true)}
                data-ocid="cards.request_submit_button"
              >
                Submit Request
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── CardsPage ─────────────────────────────────────────────────────────────

export default function CardsPage() {
  const { cards, toggleFreezeCard } = useBankStore();
  const [activeCardId, setActiveCardId] = useState(cards[0]?.id ?? "");
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState<
    "debit" | "credit" | null
  >(null);

  const activeCard = cards.find((c) => c.id === activeCardId) ?? cards[0];

  const handleFreezeToggle = () => {
    if (!activeCard) return;
    const wasFrozen = activeCard.isFrozen;
    toggleFreezeCard(activeCard.id);
    toast.success(wasFrozen ? "Card Unfrozen" : "Card Frozen", {
      description: wasFrozen
        ? "Your card is active and ready for transactions."
        : "All transactions on this card have been paused.",
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-background pb-safe">
      <AppBar title="My Cards" showLogo />

      {/* ── Card Carousel ───────────────────────────────────────── */}
      <div className="bg-card border-b border-border pt-4 pb-5">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-4 w-max">
            {cards.map((card, idx) => (
              <VirtualCard
                key={card.id}
                card={card}
                index={idx + 1}
                isSelected={card.id === activeCardId}
                onSelect={() => setActiveCardId(card.id)}
              />
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveCardId(card.id)}
              data-ocid={`cards.dot_indicator.${idx + 1}`}
              aria-label={`Select card ${idx + 1}`}
              className={cn(
                "rounded-full transition-smooth",
                card.id === activeCardId
                  ? "w-5 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/25",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Card Details ─────────────────────────────────────────── */}
      <div className="px-4 pt-4 space-y-3">
        <AnimatePresence mode="wait">
          {activeCard && (
            <motion.div
              key={activeCard.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              {/* Monthly spending bar */}
              {!activeCard.isFrozen && <SpendingBar card={activeCard} />}

              {/* Balance summary */}
              <div className="bg-card rounded-2xl px-4 py-3.5 shadow-card flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Available Balance
                  </p>
                  <p className="text-xl font-bold text-foreground font-display tabular-nums">
                    {formatGHS(activeCard.balance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Spent Today
                  </p>
                  <p className="text-base font-semibold text-foreground font-display tabular-nums">
                    {formatGHS(activeCard.spentToday)}
                  </p>
                </div>
              </div>

              {/* Action list */}
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                {/* Freeze / Unfreeze */}
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-xl",
                        activeCard.isFrozen
                          ? "bg-blue-900/20"
                          : "bg-primary/10",
                      )}
                    >
                      {activeCard.isFrozen ? (
                        <Snowflake className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Unlock className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {activeCard.isFrozen ? "Unfreeze Card" : "Freeze Card"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeCard.isFrozen
                          ? "Card is currently frozen"
                          : "Temporarily block transactions"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={activeCard.isFrozen}
                    onCheckedChange={handleFreezeToggle}
                    data-ocid="cards.freeze_toggle"
                    aria-label="Freeze or unfreeze card"
                  />
                </div>

                <Separator />

                {/* Spending Limit */}
                <button
                  type="button"
                  onClick={() => setShowLimitDialog(true)}
                  data-ocid="cards.set_limit_button"
                  className="flex items-center justify-between px-4 py-4 w-full text-left hover:bg-muted/40 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10">
                      <SlidersHorizontal className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Spending Limit
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Daily: {formatGHS(activeCard.spendingLimit)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                <Separator />

                {/* Report Lost/Stolen */}
                <button
                  type="button"
                  onClick={() => setShowReportDialog(true)}
                  data-ocid="cards.report_lost_button"
                  className="flex items-center justify-between px-4 py-4 w-full text-left hover:bg-destructive/5 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-destructive/10">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        Report Lost / Stolen
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Block this card immediately
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Request New Card ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="bg-card rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                Need a new card?
              </p>
              <p className="text-xs text-muted-foreground">
                Request a physical debit or credit card
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRequestDialog("debit")}
              data-ocid="cards.request_debit_button"
              className="h-12 flex-col gap-1 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
            >
              <CreditCard className="w-4 h-4" />
              Debit Card
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRequestDialog("credit")}
              data-ocid="cards.request_credit_button"
              className="h-12 flex-col gap-1 text-xs font-semibold border-accent/30 text-accent hover:bg-accent/5 hover:border-accent/50"
            >
              <CreditCard className="w-4 h-4" />
              Credit Card
            </Button>
          </div>
        </motion.div>

        <div className="h-4" />
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────── */}
      {activeCard && (
        <>
          <SpendingLimitDialog
            card={activeCard}
            open={showLimitDialog}
            onClose={() => setShowLimitDialog(false)}
          />
          <ReportLostDialog
            card={activeCard}
            open={showReportDialog}
            onClose={() => setShowReportDialog(false)}
          />
        </>
      )}
      <RequestCardDialog
        cardType={showRequestDialog ?? "debit"}
        open={showRequestDialog !== null}
        onClose={() => setShowRequestDialog(null)}
      />
    </div>
  );
}
