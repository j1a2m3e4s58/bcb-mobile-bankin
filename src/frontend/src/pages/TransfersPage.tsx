import { AppBar } from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatGHS } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Copy,
  Home,
  Loader2,
  Smartphone,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "bcb" | "interbank" | "momo";

interface BcbFormData {
  account: string;
  recipientName: string;
  amount: string;
  description: string;
}

interface InterbankFormData {
  bank: string;
  account: string;
  accountName: string;
  swiftCode: string;
  amount: string;
  description: string;
}

interface MomoFormData {
  provider: string;
  phone: string;
  name: string;
  amount: string;
}

interface ConfirmPayload {
  type: TabId;
  from: string;
  to: string;
  recipientName: string;
  amount: number;
  description?: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const ghanabanks = [
  "GCB Bank",
  "Ecobank Ghana",
  "Stanbic Bank",
  "Fidelity Bank",
  "Absa Bank Ghana",
  "CalBank",
  "Access Bank Ghana",
  "Standard Chartered",
  "Zenith Bank Ghana",
  "UBA Ghana",
  "First Atlantic Bank",
  "OmniBank Ghana",
  "Republic Bank Ghana",
  "Prudential Bank",
  "Agriculture Development Bank (ADB)",
];

const momoProviders = [
  {
    id: "mtn",
    name: "MTN MoMo",
    shortName: "MTN",
    bgClass: "bg-yellow-400",
    textClass: "text-yellow-900",
    borderActive: "border-yellow-400",
    bgActive: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    id: "vodafone",
    name: "Vodafone Cash",
    shortName: "Vodafone",
    bgClass: "bg-red-500",
    textClass: "text-red-900",
    borderActive: "border-red-500",
    bgActive: "bg-red-50 dark:bg-red-900/20",
  },
  {
    id: "airteltigo",
    name: "AirtelTigo Money",
    shortName: "AirtelTigo",
    bgClass: "bg-blue-600",
    textClass: "text-blue-900",
    borderActive: "border-blue-600",
    bgActive: "bg-blue-50 dark:bg-blue-900/20",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRef(): string {
  return `BCB${Date.now().toString().slice(-8).toUpperCase()}`;
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function nowDate(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  ocid: string;
}

function TabButton({ active, onClick, icon, label, ocid }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={cn(
        "flex-1 flex flex-col items-center gap-1 py-2.5 px-1 relative transition-smooth",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <span className="leading-none">{icon}</span>
      <span className="text-[11px] font-medium leading-tight whitespace-nowrap">
        {label}
      </span>
      {active && (
        <motion.span
          layoutId="tab-underline"
          className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </button>
  );
}

// ─── Bank Selector ────────────────────────────────────────────────────────────

interface BankSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

function BankSelector({ value, onChange }: BankSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        data-ocid="transfers.bank_select"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "w-full h-12 px-4 flex items-center justify-between rounded-md border bg-background text-sm transition-smooth",
          open ? "border-primary ring-2 ring-primary/20" : "border-input",
          !value && "text-muted-foreground",
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{value || "Select bank"}</span>
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 shrink-0 text-muted-foreground transition-smooth",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-popover border border-border rounded-xl shadow-elevated overflow-auto max-h-52 scrollbar-hide"
          >
            {ghanabanks.map((bank) => (
              <button
                type="button"
                key={bank}
                onClick={() => {
                  onChange(bank);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-sm text-left hover:bg-muted transition-smooth flex items-center gap-2",
                  value === bank && "bg-primary/5 text-primary font-medium",
                )}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                {bank}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── BCB Transfer Form ────────────────────────────────────────────────────────

function BcbForm({ onContinue }: { onContinue: (p: ConfirmPayload) => void }) {
  const [form, setForm] = useState<BcbFormData>({
    account: "",
    recipientName: "",
    amount: "",
    description: "",
  });

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((p) => ({
      ...p,
      account: val,
      recipientName: val.length >= 6 ? "Kofi Mensah" : "",
    }));
  };

  const set =
    (field: keyof BcbFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const canContinue =
    form.account.length >= 6 && !!form.amount && Number(form.amount) > 0;

  const handleContinue = () => {
    onContinue({
      type: "bcb",
      from: "My BCB Account (*** 890)",
      to: form.account,
      recipientName: form.recipientName || "BCB Customer",
      amount: Number(form.amount),
      description: form.description,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bcb-account">Recipient Account Number</Label>
        <Input
          id="bcb-account"
          inputMode="numeric"
          placeholder="Enter 10-digit BCB account number"
          value={form.account}
          onChange={handleAccountChange}
          className="h-12"
          maxLength={10}
          data-ocid="transfers.bcb.account_input"
        />
      </div>

      {form.recipientName && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/8 border border-primary/20"
        >
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-primary">
            {form.recipientName}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            Verified
          </span>
        </motion.div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bcb-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground select-none">
            GHS
          </span>
          <Input
            id="bcb-amount"
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={set("amount")}
            className="h-12 pl-14 text-lg font-semibold"
            data-ocid="transfers.bcb.amount_input"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bcb-desc">
          Description / Narration{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="bcb-desc"
          placeholder="e.g. Rent payment"
          value={form.description}
          onChange={set("description")}
          className="h-12"
          data-ocid="transfers.bcb.description_input"
        />
      </div>

      <Button
        type="button"
        className="h-12 text-base font-semibold w-full"
        disabled={!canContinue}
        onClick={handleContinue}
        data-ocid="transfers.bcb.continue_button"
      >
        Continue <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// ─── Interbank Form ───────────────────────────────────────────────────────────

function InterbankForm({
  onContinue,
}: { onContinue: (p: ConfirmPayload) => void }) {
  const [form, setForm] = useState<InterbankFormData>({
    bank: "",
    account: "",
    accountName: "",
    swiftCode: "",
    amount: "",
    description: "",
  });

  const set =
    (field: keyof InterbankFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const canContinue =
    !!form.bank &&
    form.account.length >= 6 &&
    !!form.amount &&
    Number(form.amount) > 0;

  const handleContinue = () => {
    onContinue({
      type: "interbank",
      from: "My BCB Account (*** 890)",
      to: `${form.bank} — ${form.account}`,
      recipientName: form.accountName || "Account Holder",
      amount: Number(form.amount),
      description: form.description,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Destination Bank</Label>
        <BankSelector
          value={form.bank}
          onChange={(v) => setForm((p) => ({ ...p, bank: v }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ib-account">Account Number</Label>
        <Input
          id="ib-account"
          inputMode="numeric"
          placeholder="Enter account number"
          value={form.account}
          onChange={set("account")}
          className="h-12"
          data-ocid="transfers.interbank.account_input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ib-name">
          Account Name{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="ib-name"
          placeholder="e.g. Ama Owusu"
          value={form.accountName}
          onChange={set("accountName")}
          className="h-12"
          data-ocid="transfers.interbank.account_name_input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ib-swift">
          SWIFT / Sort Code{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="ib-swift"
          placeholder="e.g. ECOCGHAC"
          value={form.swiftCode}
          onChange={set("swiftCode")}
          className="h-12 font-mono tracking-wider uppercase"
          data-ocid="transfers.interbank.swift_input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ib-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground select-none">
            GHS
          </span>
          <Input
            id="ib-amount"
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={set("amount")}
            className="h-12 pl-14 text-lg font-semibold"
            data-ocid="transfers.interbank.amount_input"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ib-desc">
          Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="ib-desc"
          placeholder="e.g. Invoice payment"
          value={form.description}
          onChange={set("description")}
          className="h-12"
          data-ocid="transfers.interbank.description_input"
        />
      </div>

      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/60 border border-border">
        <span className="text-xs text-muted-foreground">
          Powered by <span className="font-bold text-foreground">GhIPSS</span>
        </span>
        <span className="text-[10px] text-muted-foreground">
          1–2 business days
        </span>
      </div>

      <Button
        type="button"
        className="h-12 text-base font-semibold w-full"
        disabled={!canContinue}
        onClick={handleContinue}
        data-ocid="transfers.interbank.continue_button"
      >
        Continue <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// ─── Mobile Money Form ────────────────────────────────────────────────────────

function MomoForm({ onContinue }: { onContinue: (p: ConfirmPayload) => void }) {
  const [form, setForm] = useState<MomoFormData>({
    provider: "",
    phone: "",
    name: "",
    amount: "",
  });

  const set =
    (field: keyof MomoFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const selectedProvider = momoProviders.find((p) => p.id === form.provider);
  const canContinue =
    !!form.provider &&
    form.phone.replace(/\s/g, "").length >= 10 &&
    !!form.amount &&
    Number(form.amount) > 0;

  const handleContinue = () => {
    onContinue({
      type: "momo",
      from: "My BCB Account (*** 890)",
      to: `${selectedProvider?.name ?? "MoMo"} — ${form.phone}`,
      recipientName: form.name || "MoMo Subscriber",
      amount: Number(form.amount),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Network Provider</Label>
        <div
          className="grid grid-cols-3 gap-2"
          data-ocid="transfers.momo.provider_selector"
        >
          {momoProviders.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setForm((prev) => ({ ...prev, provider: p.id }))}
              data-ocid={`transfers.momo.provider.${p.id}`}
              className={cn(
                "flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-smooth",
                form.provider === p.id
                  ? `${p.borderActive} ${p.bgActive}`
                  : "border-border bg-card hover:border-muted-foreground/30",
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center",
                  p.bgClass,
                )}
              >
                <Smartphone className={cn("w-4 h-4", p.textClass)} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold leading-tight text-center",
                  form.provider === p.id
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {p.shortName}
              </span>
            </button>
          ))}
        </div>
        {selectedProvider && (
          <motion.p
            key={selectedProvider.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            Sending via{" "}
            <span className="font-medium text-foreground">
              {selectedProvider.name}
            </span>
          </motion.p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="momo-phone">Mobile Number</Label>
        <Input
          id="momo-phone"
          type="tel"
          inputMode="tel"
          placeholder="024 xxx xxxx"
          value={form.phone}
          onChange={set("phone")}
          className="h-12"
          maxLength={12}
          data-ocid="transfers.momo.phone_input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="momo-name">
          Recipient Name{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="momo-name"
          placeholder="e.g. Kwame Asante"
          value={form.name}
          onChange={set("name")}
          className="h-12"
          data-ocid="transfers.momo.name_input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="momo-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground select-none">
            GHS
          </span>
          <Input
            id="momo-amount"
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={set("amount")}
            className="h-12 pl-14 text-lg font-semibold"
            data-ocid="transfers.momo.amount_input"
          />
        </div>
      </div>

      <Button
        type="button"
        className="h-12 text-base font-semibold w-full"
        disabled={!canContinue}
        onClick={handleContinue}
        data-ocid="transfers.momo.continue_button"
      >
        Continue <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// ─── Confirmation Bottom Sheet ────────────────────────────────────────────────

interface ConfirmSheetProps {
  payload: ConfirmPayload;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

function ConfirmSheet({
  payload,
  onClose,
  onConfirm,
  isProcessing,
}: ConfirmSheetProps) {
  const typeLabel = {
    bcb: "BCB Transfer",
    interbank: "Interbank (GhIPSS)",
    momo: "Mobile Money",
  }[payload.type];
  const feeLabel = { bcb: "Free", interbank: "GHS 5.00", momo: "GHS 1.00" }[
    payload.type
  ];

  const rows = [
    { label: "From", value: payload.from },
    { label: "To", value: payload.to },
    { label: "Recipient", value: payload.recipientName },
    { label: "Amount", value: formatGHS(payload.amount), highlight: true },
    { label: "Transfer Fee", value: feeLabel },
    ...(payload.description
      ? [{ label: "Note", value: payload.description, highlight: false }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={() => !isProcessing && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="bg-card rounded-t-3xl p-6 pb-10 shadow-elevated max-w-[430px] w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
        data-ocid="transfers.confirm_sheet"
      >
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />
        <h2 className="text-lg font-bold font-display text-foreground mb-0.5">
          Confirm Transfer
        </h2>
        <p className="text-sm text-muted-foreground mb-5">{typeLabel}</p>

        <div className="rounded-xl overflow-hidden border border-border mb-5">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "flex items-start justify-between px-4 py-3 text-sm gap-3",
                i > 0 && "border-t border-border",
                row.highlight && "bg-primary/5",
              )}
            >
              <span className="text-muted-foreground shrink-0">
                {row.label}
              </span>
              <span
                className={cn(
                  "font-medium text-right break-words min-w-0",
                  row.highlight && "text-primary font-bold text-base",
                )}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={onClose}
            disabled={isProcessing}
            data-ocid="transfers.confirm_sheet.cancel_button"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-12 font-semibold"
            onClick={onConfirm}
            disabled={isProcessing}
            data-ocid="transfers.confirm_sheet.confirm_button"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing…
              </>
            ) : (
              "Confirm Transfer"
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

interface SuccessScreenProps {
  payload: ConfirmPayload;
  txRef: string;
  onDone: () => void;
}

function SuccessScreen({ payload, txRef, onDone }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(txRef).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center px-6 pt-10 pb-8"
      data-ocid="transfers.success_screen"
    >
      {/* Animated check */}
      <div className="relative mb-7">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 400,
            damping: 20,
          }}
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.25,
              type: "spring",
              stiffness: 500,
              damping: 18,
            }}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center"
          >
            <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
          </motion.div>
        </motion.div>
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0.5 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{
              delay: 0.3 + i * 0.2,
              duration: 0.75,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full border-2 border-primary"
          />
        ))}
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold font-display text-foreground mb-1"
      >
        Transfer Successful!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-muted-foreground mb-2 text-center"
      >
        Sent to {payload.recipientName}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="text-3xl font-bold text-primary font-display mb-8"
      >
        {formatGHS(payload.amount)}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full bg-muted/50 rounded-2xl p-4 mb-3 border border-border"
      >
        <p className="text-xs text-muted-foreground mb-1.5">
          Transaction Reference
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold text-foreground tracking-wider">
            {txRef}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            data-ocid="transfers.success_screen.copy_button"
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:opacity-70 transition-smooth shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full bg-muted/30 rounded-xl p-4 mb-8 border border-border"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Destination</span>
          <span className="font-medium text-foreground text-right ml-4 break-words min-w-0 max-w-[60%]">
            {payload.to}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="w-full"
      >
        <Button
          className="w-full h-12 font-semibold"
          onClick={onDone}
          data-ocid="transfers.success_screen.done_button"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type PageState = "form" | "success";

export default function TransfersPage() {
  const navigate = useNavigate();
  const addTransaction = useBankStore((s) => s.addTransaction);

  const [activeTab, setActiveTab] = useState<TabId>("bcb");
  const [confirmPayload, setConfirmPayload] = useState<ConfirmPayload | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageState, setPageState] = useState<PageState>("form");
  const [txRef, setTxRef] = useState("");
  const [successPayload, setSuccessPayload] = useState<ConfirmPayload | null>(
    null,
  );

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: "bcb",
      label: "BCB Transfer",
      icon: <ArrowLeftRight className="w-[18px] h-[18px]" />,
    },
    {
      id: "interbank",
      label: "Interbank",
      icon: <Building2 className="w-[18px] h-[18px]" />,
    },
    {
      id: "momo",
      label: "Mobile Money",
      icon: <Smartphone className="w-[18px] h-[18px]" />,
    },
  ];

  const handleConfirm = async () => {
    if (!confirmPayload) return;
    setIsProcessing(true);
    await new Promise<void>((r) => setTimeout(r, 1500));
    setIsProcessing(false);

    const ref = generateRef();
    setTxRef(ref);
    setSuccessPayload(confirmPayload);

    // Category mapping
    const categoryMap: Record<TabId, "transfer" | "momo"> = {
      bcb: "transfer",
      interbank: "transfer",
      momo: "momo",
    };
    const iconMap: Record<TabId, string> = {
      bcb: "🏦",
      interbank: "🏛️",
      momo: "📱",
    };

    addTransaction({
      id: ref,
      type: "debit",
      title: `Transfer to ${confirmPayload.recipientName}`,
      description: confirmPayload.description || confirmPayload.to,
      amount: -confirmPayload.amount,
      date: nowDate(),
      time: nowTime(),
      reference: ref,
      status: "completed",
      category: categoryMap[confirmPayload.type],
      icon: iconMap[confirmPayload.type],
    });

    toast.success("Transfer completed!", {
      description: `${formatGHS(confirmPayload.amount)} sent to ${confirmPayload.recipientName}`,
    });
    setConfirmPayload(null);
    setPageState("success");
  };

  const handleDone = () => {
    navigate({ to: "/dashboard" });
  };

  // ─── Success View ──────────────────────────────────────────────────────────
  if (pageState === "success" && successPayload) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <AppBar
          title="Transfer Receipt"
          showBack={false}
          showNotifications={false}
        />
        <SuccessScreen
          payload={successPayload}
          txRef={txRef}
          onDone={handleDone}
        />
      </div>
    );
  }

  // ─── Form View ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppBar title="Transfers" showBack />

      {/* Custom tab bar with animated green underline */}
      <div
        className="bg-card border-b border-border px-2 sticky top-14 z-30"
        data-ocid="transfers.tabs"
      >
        <div className="flex">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
              ocid={`transfers.${tab.id}_tab`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
          className="flex-1 px-4 pt-5 pb-10"
        >
          <div className="bg-card rounded-2xl p-5 shadow-card">
            {/* Tab header */}
            {activeTab === "bcb" && (
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bcb-card-gradient flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground font-display">
                    BCB Internal Transfer
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Instant · Free · 24/7
                  </p>
                </div>
              </div>
            )}
            {activeTab === "interbank" && (
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground font-display">
                    Interbank Transfer
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Via GhIPSS · GHS 5 fee · 1–2 business days
                  </p>
                </div>
              </div>
            )}
            {activeTab === "momo" && (
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground font-display">
                    Mobile Money Transfer
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    MTN · Vodafone · AirtelTigo · GHS 1 fee
                  </p>
                </div>
              </div>
            )}

            {activeTab === "bcb" && <BcbForm onContinue={setConfirmPayload} />}
            {activeTab === "interbank" && (
              <InterbankForm onContinue={setConfirmPayload} />
            )}
            {activeTab === "momo" && (
              <MomoForm onContinue={setConfirmPayload} />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Confirmation bottom sheet */}
      <AnimatePresence>
        {confirmPayload && (
          <ConfirmSheet
            payload={confirmPayload}
            onClose={() => !isProcessing && setConfirmPayload(null)}
            onConfirm={handleConfirm}
            isProcessing={isProcessing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
