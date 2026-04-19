import { AppBar } from "@/components/layout/AppBar";
import { PinConfirmDialog } from "@/components/PinConfirmDialog";
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
  Globe2,
  Plus,
  ShieldAlert,
  SmartphoneNfc,
  SlidersHorizontal,
  Snowflake,
  Unlock,
  Wifi,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

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
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      data-ocid={`cards.card.${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: (index - 1) * 0.08 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative h-[202px] w-[320px] flex-shrink-0 overflow-hidden rounded-3xl p-5 text-left text-white shadow-elevated transition-smooth",
        isSelected
          ? "ring-2 ring-accent ring-offset-4 ring-offset-background"
          : "opacity-95",
      )}
      style={{
        background:
          card.network === "visa"
            ? "linear-gradient(135deg, oklch(0.34 0.13 148) 0%, oklch(0.46 0.14 148) 45%, oklch(0.58 0.12 145) 72%, oklch(0.66 0.15 70) 100%)"
            : "linear-gradient(135deg, oklch(0.25 0.06 250) 0%, oklch(0.34 0.08 230) 48%, oklch(0.48 0.12 185) 100%)",
      }}
      aria-label={`${card.network} ${card.type} card`}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute right-6 top-1/3 h-16 w-16 rounded-full border border-white/10" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70">
              BCB
            </p>
            <p className="text-xs capitalize text-white/80">{card.type} card</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
              card.isFrozen
                ? "border-blue-300/40 bg-blue-950/30 text-blue-100"
                : "border-white/25 bg-white/10 text-white/80",
            )}
          >
            {card.isFrozen ? "Frozen" : "Active"}
          </Badge>
        </div>

        <div className="space-y-3">
          <div
            className="h-9 w-12 rounded-md"
            style={{
              background:
                "linear-gradient(135deg, #e8c97a 0%, #c8a84b 50%, #e8c97a 100%)",
            }}
          />

          <p className="font-mono text-base tracking-[0.28em] text-white/90">
            {card.cardNumber}
          </p>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/55">
                Card Holder
              </p>
              <p className="text-xs font-bold tracking-[0.18em]">
                {card.cardHolder}
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/55">
                Expires
              </p>
              <p className="text-xs font-bold">{card.expiry}</p>
            </div>

            {card.network === "visa" ? (
              <span className="text-xl font-black italic tracking-tight">
                VISA
              </span>
            ) : (
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-red-500/85" />
                <div className="-ml-3 h-6 w-6 rounded-full bg-amber-400/85" />
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {card.isFrozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/55 backdrop-blur-[2px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-300/35 bg-blue-950/40">
              <Snowflake className="h-6 w-6 text-blue-200" />
            </div>
            <span className="text-sm font-extrabold uppercase tracking-[0.35em]">
              Frozen
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function SpendingBar({ card }: { card: BankCard }) {
  const monthlySpent = card.network === "visa" ? 2340 : 680;
  const monthlyLimit = Math.max(card.spendingLimit * 6, 1);
  const percentage = Math.min((monthlySpent / monthlyLimit) * 100, 100);
  const isWarm = percentage >= 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card px-4 py-3.5 shadow-card"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          Monthly spend
        </span>
        <span
          className={cn(
            "text-xs font-bold tabular-nums",
            isWarm ? "text-accent" : "text-primary",
          )}
        >
          {Math.round(percentage)}% used
        </span>
      </div>

      <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            isWarm ? "bg-accent" : "bg-primary",
          )}
        />
      </div>

      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{formatGHS(monthlySpent)} spent</span>
        <span>of {formatGHS(monthlyLimit)} limit</span>
      </div>
    </motion.div>
  );
}

function SpendingLimitDialog({
  card,
  open,
  onClose,
}: {
  card: BankCard;
  open: boolean;
  onClose: () => void;
}) {
  const setSpendingLimit = useBankStore((state) => state.setSpendingLimit);
  const [daily, setDaily] = useState(card.spendingLimit);
  const [monthly, setMonthly] = useState(card.spendingLimit * 6);
  const [pinOpen, setPinOpen] = useState(false);

  const handleSave = () => {
    setPinOpen(true);
  };

  const handlePinConfirmed = () => {
    setSpendingLimit(card.id, daily);
    toast.success("Spending limits updated", {
      description: `Daily ${formatGHS(daily)} | Monthly ${formatGHS(monthly)}`,
    });
    setPinOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm" data-ocid="cards.limit_dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Set spending limits</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Adjust daily and monthly transaction limits for this card.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-1">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Daily limit</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">GHS</span>
                  <Input
                    type="number"
                    min={100}
                    max={50000}
                    value={daily}
                    onChange={(event) => setDaily(Number(event.target.value))}
                    className="h-8 w-24 text-right text-sm font-bold"
                    data-ocid="cards.daily_limit_input"
                  />
                </div>
              </div>
              <Slider
                value={[daily]}
                min={100}
                max={20000}
                step={100}
                onValueChange={([value]) => setDaily(value)}
                data-ocid="cards.daily_limit_slider"
              />
            </div>

            <Separator />

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Monthly limit</Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">GHS</span>
                  <Input
                    type="number"
                    min={500}
                    max={200000}
                    value={monthly}
                    onChange={(event) => setMonthly(Number(event.target.value))}
                    className="h-8 w-24 text-right text-sm font-bold"
                    data-ocid="cards.monthly_limit_input"
                  />
                </div>
              </div>
              <Slider
                value={[monthly]}
                min={500}
                max={100000}
                step={500}
                onValueChange={([value]) => setMonthly(value)}
                data-ocid="cards.monthly_limit_slider"
              />
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
              Save limits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinConfirmDialog
        open={pinOpen}
        title="Confirm Card Settings"
        description="Enter your 4-digit PIN to update this card's spending limits."
        confirmLabel="Update Limits"
        onOpenChange={setPinOpen}
        onConfirm={handlePinConfirmed}
      />
    </>
  );
}

function ReportLostDialog({
  card,
  open,
  onClose,
}: {
  card: BankCard;
  open: boolean;
  onClose: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);

  const handleReport = () => {
    setDone(true);
    setTimeout(() => {
      toast.success("Card reported", {
        description: "A replacement card will be issued within 5 to 7 business days.",
      });
      setDone(false);
      setConfirmed(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-ocid="cards.report_dialog">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="font-display text-destructive">
              Report lost or stolen
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            This will immediately block card ending in{" "}
            <strong>{card.cardNumber.slice(-4)}</strong> and stop all transactions.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Card blocked successfully
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
              <Checkbox
                id="report-confirm"
                checked={confirmed}
                onCheckedChange={(value) => setConfirmed(Boolean(value))}
                data-ocid="cards.report_confirm_checkbox"
              />
              <Label
                htmlFor="report-confirm"
                className="cursor-pointer text-xs leading-relaxed text-muted-foreground"
              >
                I confirm this card has been lost or stolen and authorize BCB to
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
                Report card
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RequestCardDialog({
  cardType,
  open,
  onClose,
}: {
  cardType: "debit" | "credit";
  open: boolean;
  onClose: () => void;
}) {
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
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="font-display capitalize">
              Request {cardType} card
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1.5">
              <p className="font-display font-bold text-foreground">
                Request submitted
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your card request has been received. Please allow 5 to 7 business days.
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
                  Card type
                </Label>
                <div className="flex h-10 items-center gap-2 rounded-xl border border-input bg-muted/40 px-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize text-foreground">
                    {cardType} card
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="delivery-address"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Delivery address
                </Label>
                <Input
                  id="delivery-address"
                  placeholder="House 12, Bawjiase Road, Central Region"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="rounded-xl"
                  data-ocid="cards.request_address_input"
                />
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3">
                <Checkbox
                  id="identity-confirm"
                  checked={identityConfirmed}
                  onCheckedChange={(value) => setIdentityConfirmed(Boolean(value))}
                  data-ocid="cards.request_identity_checkbox"
                />
                <Label
                  htmlFor="identity-confirm"
                  className="cursor-pointer text-xs leading-relaxed text-muted-foreground"
                >
                  I confirm my identity as a verified BCB account holder and agree
                  to the card issuance terms.
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
                Submit request
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function CardsPage() {
  const cards = useBankStore((state) => state.cards);
  const toggleFreezeCard = useBankStore((state) => state.toggleFreezeCard);
  const [activeCardId, setActiveCardId] = useState(cards[0]?.id ?? "");
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState<
    "debit" | "credit" | null
  >(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [pendingControl, setPendingControl] = useState<string | null>(null);
  const [cardControls, setCardControls] = useState<Record<string, Record<string, boolean>>>({});

  const activeCard = cards.find((card) => card.id === activeCardId) ?? cards[0];
  const activeControls = cardControls[activeCard?.id ?? ""] ?? {
    online: true,
    international: false,
    contactless: true,
    atm: true,
  };

  const handleFreezeToggle = () => {
    setPinOpen(true);
  };

  const handleFreezePinConfirmed = () => {
    if (!activeCard) return;
    const wasFrozen = activeCard.isFrozen;
    toggleFreezeCard(activeCard.id);
    setPinOpen(false);
    toast.success(wasFrozen ? "Card unfrozen" : "Card frozen", {
      description: wasFrozen
        ? "Your card is active and ready for transactions."
        : "All transactions on this card have been paused.",
    });
  };

  const handleControlToggle = (control: string) => {
    setPendingControl(control);
    setPinOpen(true);
  };

  const handleControlPinConfirmed = () => {
    if (!activeCard || !pendingControl) return;
    setCardControls((current) => {
      const existing = current[activeCard.id] ?? activeControls;
      return {
        ...current,
        [activeCard.id]: {
          ...existing,
          [pendingControl]: !existing[pendingControl],
        },
      };
    });
    toast.success("Card control updated");
    setPendingControl(null);
    setPinOpen(false);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-safe">
      <AppBar title="My Cards" showLogo />

      <div className="border-b border-border bg-card pb-5 pt-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex w-max gap-4 px-4">
            {cards.map((card, index) => (
              <VirtualCard
                key={card.id}
                card={card}
                index={index + 1}
                isSelected={card.id === activeCardId}
                onSelect={() => setActiveCardId(card.id)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveCardId(card.id)}
              data-ocid={`cards.dot_indicator.${index + 1}`}
              aria-label={`Select card ${index + 1}`}
              className={cn(
                "rounded-full transition-smooth",
                card.id === activeCardId
                  ? "h-2 w-5 bg-primary"
                  : "h-2 w-2 bg-muted-foreground/25",
              )}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4">
        <AnimatePresence mode="wait">
          {activeCard && (
            <motion.div
              key={activeCard.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {!activeCard.isFrozen && <SpendingBar card={activeCard} />}

              <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-card">
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">
                    Available balance
                  </p>
                  <p className="font-display text-xl font-bold text-foreground tabular-nums">
                    {formatGHS(activeCard.balance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="mb-0.5 text-xs text-muted-foreground">Spent today</p>
                  <p className="font-display text-base font-semibold text-foreground tabular-nums">
                    {formatGHS(activeCard.spentToday)}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl bg-card shadow-card">
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        activeCard.isFrozen ? "bg-blue-900/20" : "bg-primary/10",
                      )}
                    >
                      {activeCard.isFrozen ? (
                        <Snowflake className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Unlock className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {activeCard.isFrozen ? "Unfreeze card" : "Freeze card"}
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

                <button
                  type="button"
                  onClick={() => setShowLimitDialog(true)}
                  data-ocid="cards.set_limit_button"
                  className="flex w-full items-center justify-between px-4 py-4 text-left transition-smooth hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                      <SlidersHorizontal className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Spending limit
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Daily: {formatGHS(activeCard.spendingLimit)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <Separator />

                <button
                  type="button"
                  onClick={() => setShowReportDialog(true)}
                  data-ocid="cards.report_lost_button"
                  className="flex w-full items-center justify-between px-4 py-4 text-left transition-smooth hover:bg-destructive/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-destructive">
                        Report lost or stolen
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Block this card immediately
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl bg-card shadow-card">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Card controls</p>
                  <p className="text-xs text-muted-foreground">PIN required for every control change.</p>
                </div>
                {[
                  { key: "online", label: "Online payments", desc: "Allow web and app purchases", icon: Wifi },
                  { key: "international", label: "International use", desc: "Allow transactions outside Ghana", icon: Globe2 },
                  { key: "contactless", label: "Contactless payments", desc: "Tap to pay at POS terminals", icon: SmartphoneNfc },
                  { key: "atm", label: "ATM withdrawals", desc: "Allow cash withdrawals", icon: CreditCard },
                ].map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between border-b border-border px-4 py-4 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={activeControls[key]}
                      onCheckedChange={() => handleControlToggle(key)}
                      aria-label={label}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="rounded-2xl bg-card p-4 shadow-card"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Need a new card</p>
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
              className="h-12 flex-col gap-1 border-primary/30 text-xs font-semibold text-primary hover:bg-primary/5 hover:border-primary/50"
            >
              <CreditCard className="h-4 w-4" />
              Debit Card
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRequestDialog("credit")}
              data-ocid="cards.request_credit_button"
              className="h-12 flex-col gap-1 border-accent/30 text-xs font-semibold text-accent hover:bg-accent/5 hover:border-accent/50"
            >
              <CreditCard className="h-4 w-4" />
              Credit Card
            </Button>
          </div>
        </motion.div>

        <div className="h-4" />
      </div>

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

      <PinConfirmDialog
        open={pinOpen}
        title={pendingControl ? "Confirm Card Control" : activeCard?.isFrozen ? "Confirm Card Unfreeze" : "Confirm Card Freeze"}
        description={pendingControl ? "Enter your 4-digit PIN to update this card control." : "Enter your 4-digit PIN to change this card's freeze status."}
        confirmLabel={pendingControl ? "Update Control" : activeCard?.isFrozen ? "Unfreeze Card" : "Freeze Card"}
        onOpenChange={(open) => {
          setPinOpen(open);
          if (!open) setPendingControl(null);
        }}
        onConfirm={pendingControl ? handleControlPinConfirmed : handleFreezePinConfirmed}
      />
    </div>
  );
}
