import { AppBar } from "@/components/layout/AppBar";
import { BrandLogo, type TelecomBrand } from "@/components/BrandLogo";
import { PinConfirmDialog } from "@/components/PinConfirmDialog";
import { ProfessionalReceipt } from "@/components/ProfessionalReceipt";
import { Button } from "@/components/ui/button";
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
import { formatDate, formatGHS } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useBankStore } from "@/store/bank-store";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ArrowRight,
  Building2,
  Edit3,
  Loader2,
  Smartphone,
  Trash2,
  UserPlus,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type TabId = "bcb" | "interbank" | "momo" | "account-wallet" | "wallet-account";

interface TransferFormState {
  account: string;
  recipientName: string;
  amount: string;
  description: string;
  bank: string;
  provider: string;
  phone: string;
}

interface Beneficiary {
  id: string;
  type: TabId;
  name: string;
  destination: string;
  bankOrProvider: string;
}

interface ConfirmPayload {
  type: TabId;
  from: string;
  to: string;
  recipientName: string;
  amount: number;
  description: string;
  fee: number;
}

interface CompletedTransfer {
  payload: ConfirmPayload;
  reference: string;
  date: string;
  time: string;
}

const BANKS = [
  "GCB Bank",
  "Ecobank Ghana",
  "Stanbic Bank",
  "Fidelity Bank",
  "Absa Bank Ghana",
  "CalBank",
];

const PROVIDERS = ["MTN MoMo", "Telecel Cash", "AirtelTigo Money"];
const PROVIDER_BRANDS: Record<string, TelecomBrand> = {
  "MTN MoMo": "MTN",
  "Telecel Cash": "Telecel",
  "AirtelTigo Money": "AirtelTigo",
};

const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: "ben_1",
    type: "bcb",
    name: "Akosua Frimpong",
    destination: "1234509876",
    bankOrProvider: "BCB",
  },
  {
    id: "ben_2",
    type: "momo",
    name: "Ama Asante",
    destination: "0554321876",
    bankOrProvider: "MTN MoMo",
  },
];

function generateRef() {
  return `BCB${Date.now().toString().slice(-8)}`;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function nowTime() {
  return new Date().toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function isValidGhanaPhone(value: string) {
  const digits = digitsOnly(value);
  return /^(0\d{9}|233\d{9})$/.test(digits);
}

function formatDestination(tab: TabId, form: TransferFormState) {
  if (tab === "account-wallet") return "BCB Mobile Wallet";
  if (tab === "wallet-account") return "BCB Current Account";
  if (tab === "bcb") return form.account;
  if (tab === "interbank") return `${form.bank} - ${form.account}`;
  return `${form.provider} - ${form.phone}`;
}

function getFee(tab: TabId) {
  if (tab === "interbank") return 5;
  if (tab === "momo") return 1;
  return 0;
}

function buildPayload(tab: TabId, form: TransferFormState): ConfirmPayload {
  return {
    type: tab,
    from: tab === "wallet-account" ? "BCB Mobile Wallet" : "My BCB Current Account",
    to: formatDestination(tab, form),
    recipientName:
      form.recipientName ||
      (tab === "momo"
        ? "MoMo Subscriber"
        : tab === "account-wallet"
          ? "My BCB Wallet"
          : tab === "wallet-account"
            ? "My BCB Current Account"
            : "Account Holder"),
    amount: Number(form.amount),
    description: form.description,
    fee: getFee(tab),
  };
}

function isWalletTransfer(tab: TabId) {
  return tab === "account-wallet" || tab === "wallet-account";
}

function tabMeta(tab: TabId) {
  if (tab === "bcb") {
    return {
      label: "BCB Transfer",
      icon: <ArrowLeftRight className="h-4 w-4" />,
      helper: "Instant | Free | 24/7",
      category: "transfer" as const,
      iconKey: "building-bank" as const,
    };
  }

  if (tab === "interbank") {
    return {
      label: "Interbank",
      icon: <Building2 className="h-4 w-4" />,
      helper: "GhIPSS | GHS 5.00 fee | 1-2 business days",
      category: "transfer" as const,
      iconKey: "landmark" as const,
    };
  }

  if (tab === "account-wallet") {
    return {
      label: "Account to Wallet",
      icon: <Wallet className="h-4 w-4" />,
      helper: "Move funds from current account to wallet | Free",
      category: "momo" as const,
      iconKey: "wallet" as const,
    };
  }

  if (tab === "wallet-account") {
    return {
      label: "Wallet to Account",
      icon: <Wallet className="h-4 w-4" />,
      helper: "Move funds from wallet to current account | Free",
      category: "momo" as const,
      iconKey: "wallet" as const,
    };
  }

  return {
    label: "Mobile Money",
    icon: <Smartphone className="h-4 w-4" />,
    helper: "MTN | Telecel | AirtelTigo | GHS 1.00 fee",
    category: "momo" as const,
    iconKey: "smartphone" as const,
  };
}

function validateTransfer(tab: TabId, form: TransferFormState, currentBalance: number, walletBalance: number) {
  const errors: Partial<Record<keyof TransferFormState | "balance", string>> = {};
  const amount = Number(form.amount);
  const totalDebit = amount + getFee(tab);
  const sourceBalance = tab === "wallet-account" ? walletBalance : currentBalance;

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than GHS 0.00.";
  } else if (amount < 1) {
    errors.amount = "Minimum transfer amount is GHS 1.00.";
  }

  if (totalDebit > sourceBalance) {
    errors.balance = `Insufficient balance. Available: ${formatGHS(sourceBalance)}.`;
  }

  if (!isWalletTransfer(tab) && !form.recipientName.trim()) {
    errors.recipientName = "Enter the recipient name.";
  }

  if (tab === "bcb" && digitsOnly(form.account).length !== 10) {
    errors.account = "BCB account number must be exactly 10 digits.";
  }

  if (tab === "interbank" && digitsOnly(form.account).length < 6) {
    errors.account = "Enter a valid destination account number.";
  }

  if (tab === "momo" && !isValidGhanaPhone(form.phone)) {
    errors.phone = "Enter a valid Ghana mobile number, e.g. 0241234567.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

function ConfirmSheet({
  payload,
  busy,
  onCancel,
  onConfirm,
}: {
  payload: ConfirmPayload;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const totalDebit = payload.amount + payload.fee;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="w-full max-w-[430px] rounded-3xl bg-card p-6 shadow-elevated"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
        <h2 className="font-display text-lg font-bold">Confirm Transfer</h2>
        <p className="mb-5 text-sm text-muted-foreground">{tabMeta(payload.type).label}</p>

        <div className="space-y-3 rounded-2xl border border-border p-4">
          {[
            ["From", payload.from],
            ["To", payload.to],
            ["Recipient", payload.recipientName],
            ["Amount", formatGHS(payload.amount)],
            ["Transfer Fee", payload.fee === 0 ? "Free" : formatGHS(payload.fee)],
            ["Total Debit", formatGHS(totalDebit)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-right font-medium">{value}</span>
            </div>
          ))}

          {payload.description && (
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Note</span>
              <span className="text-right font-medium">{payload.description}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={busy} onClick={onConfirm}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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

function TransferReceipt({
  completed,
  onDone,
}: {
  completed: CompletedTransfer;
  onDone: () => void;
}) {
  const { payload, reference, date, time } = completed;

  const rows = [
    { label: "Recipient", value: payload.recipientName },
    { label: "Destination", value: payload.to },
    { label: "Transfer Type", value: tabMeta(payload.type).label },
    { label: "Amount", value: formatGHS(payload.amount), tone: "danger" as const },
    { label: "Fee", value: payload.fee === 0 ? "Free" : formatGHS(payload.fee) },
    { label: "Total Debit", value: formatGHS(payload.amount + payload.fee), tone: "danger" as const },
    ...(payload.description ? [{ label: "Narration", value: payload.description }] : []),
  ];

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-md">
        <ProfessionalReceipt
          title="Transfer Receipt"
          subtitle="Transfer Successful"
          amount={formatGHS(payload.amount)}
          reference={reference}
          dateTime={`${formatDate(date)} at ${time}`}
          rows={rows}
          onDone={onDone}
          doneLabel="Back to Dashboard"
        />
      </div>
    </div>
  );
}

function BeneficiaryManager({
  beneficiaries,
  activeType,
  onUse,
  onSave,
  onDelete,
}: {
  beneficiaries: Beneficiary[];
  activeType: TabId;
  onUse: (beneficiary: Beneficiary) => void;
  onSave: (beneficiary: Beneficiary) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [draft, setDraft] = useState<Beneficiary>({
    id: "",
    type: activeType,
    name: "",
    destination: "",
    bankOrProvider: activeType === "momo" ? PROVIDERS[0] : activeType === "interbank" ? BANKS[0] : "BCB",
  });

  const filtered = beneficiaries.filter((beneficiary) => beneficiary.type === activeType);

  const startAdd = () => {
    setEditing(null);
    setDraft({
      id: "",
      type: activeType,
      name: "",
      destination: "",
      bankOrProvider: activeType === "momo" ? PROVIDERS[0] : activeType === "interbank" ? BANKS[0] : "BCB",
    });
    setOpen(true);
  };

  const startEdit = (beneficiary: Beneficiary) => {
    setEditing(beneficiary);
    setDraft(beneficiary);
    setOpen(true);
  };

  const save = () => {
    if (!draft.name.trim() || !draft.destination.trim()) return;
    onSave({
      ...draft,
      id: editing?.id ?? `ben_${Date.now()}`,
      type: activeType,
    });
    setOpen(false);
  };

  return (
    <div className="rounded-3xl bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold">Beneficiaries</h3>
          <p className="text-xs text-muted-foreground">Save people you send money to often.</p>
        </div>
        <Button size="sm" variant="outline" onClick={startAdd} className="gap-1">
          <UserPlus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
          No saved beneficiaries for this transfer type yet.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((beneficiary) => (
            <div key={beneficiary.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onUse(beneficiary)}>
                <p className="truncate text-sm font-semibold">{beneficiary.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {beneficiary.bankOrProvider} | {beneficiary.destination}
                </p>
              </button>
              <button type="button" onClick={() => startEdit(beneficiary)} className="text-muted-foreground">
                <Edit3 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onDelete(beneficiary.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Beneficiary" : "Add Beneficiary"}</DialogTitle>
            <DialogDescription>
              Save the beneficiary for faster future transfers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="beneficiary-name">Name</Label>
              <Input
                id="beneficiary-name"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Beneficiary name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="beneficiary-destination">
                {activeType === "momo" ? "Mobile number" : "Account number"}
              </Label>
              <Input
                id="beneficiary-destination"
                value={draft.destination}
                onChange={(event) => setDraft((current) => ({ ...current, destination: event.target.value }))}
                placeholder={activeType === "momo" ? "0241234567" : "Account number"}
              />
            </div>
            {activeType !== "bcb" && (
              <div className="space-y-1.5">
                <Label htmlFor="beneficiary-provider">
                  {activeType === "momo" ? "Provider" : "Bank"}
                </Label>
                <select
                  id="beneficiary-provider"
                  value={draft.bankOrProvider}
                  onChange={(event) => setDraft((current) => ({ ...current, bankOrProvider: event.target.value }))}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {(activeType === "momo" ? PROVIDERS : BANKS).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!draft.name.trim() || !draft.destination.trim()}>
              Save Beneficiary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TransfersPage() {
  const navigate = useNavigate();
  const recordActivity = useBankStore((state) => state.recordActivity);
  const currentBalance = useBankStore((state) => state.currentBalance);
  const walletBalance = useBankStore((state) => state.walletBalance);
  const transferAccountToWallet = useBankStore((state) => state.transferAccountToWallet);
  const transferWalletToAccount = useBankStore((state) => state.transferWalletToAccount);

  const [tab, setTab] = useState<TabId>("bcb");
  const [busy, setBusy] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<ConfirmPayload | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [completed, setCompleted] = useState<CompletedTransfer | null>(null);
  const [beneficiaries, setBeneficiaries] = useState(INITIAL_BENEFICIARIES);
  const [form, setForm] = useState<TransferFormState>({
    account: "",
    recipientName: "",
    amount: "",
    description: "",
    bank: BANKS[0],
    provider: PROVIDERS[0],
    phone: "",
  });
  const [touched, setTouched] = useState(false);

  const meta = tabMeta(tab);
  const errors = useMemo(
    () => validateTransfer(tab, form, currentBalance, walletBalance),
    [currentBalance, form, tab, walletBalance],
  );
  const canContinue = Object.keys(errors).length === 0;

  const updateField = (field: keyof TransferFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleContinue = () => {
    setTouched(true);
    if (!canContinue) return;
    setConfirmPayload(buildPayload(tab, form));
  };

  const handleConfirm = () => setPinOpen(true);

  const handlePinConfirmed = async () => {
    if (!confirmPayload) return;

    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const ref = generateRef();
    const date = today();
    const time = nowTime();

    if (confirmPayload.type === "account-wallet") {
      transferAccountToWallet(
        confirmPayload.amount,
        ref,
        confirmPayload.description || "Moved from current account to wallet",
      );
    } else if (confirmPayload.type === "wallet-account") {
      transferWalletToAccount(
        confirmPayload.amount,
        ref,
        confirmPayload.description || "Moved from wallet to current account",
      );
    } else {
      recordActivity({
        type: "debit",
        category: meta.category,
        title: `Transfer to ${confirmPayload.recipientName}`,
        description: confirmPayload.description || confirmPayload.to,
        amount: confirmPayload.amount + confirmPayload.fee,
        reference: ref,
        icon: meta.iconKey,
        notification: {
          type: "transaction",
          title: "Transfer Completed",
          message: `${formatGHS(confirmPayload.amount)} was sent to ${confirmPayload.recipientName}.`,
        },
      });
    }

    setCompleted({ payload: confirmPayload, reference: ref, date, time });
    setConfirmPayload(null);
    setPinOpen(false);
    setBusy(false);
    toast.success("Transfer completed", {
      description: isWalletTransfer(confirmPayload.type)
        ? `${formatGHS(confirmPayload.amount)} moved successfully.`
        : `${formatGHS(confirmPayload.amount)} sent to ${confirmPayload.recipientName}`,
    });
  };

  const useBeneficiary = (beneficiary: Beneficiary) => {
    setForm((current) => ({
      ...current,
      recipientName: beneficiary.name,
      account: beneficiary.type === "momo" ? current.account : beneficiary.destination,
      phone: beneficiary.type === "momo" ? beneficiary.destination : current.phone,
      bank: beneficiary.type === "interbank" ? beneficiary.bankOrProvider : current.bank,
      provider: beneficiary.type === "momo" ? beneficiary.bankOrProvider : current.provider,
    }));
    toast.success(`${beneficiary.name} selected`);
  };

  const saveBeneficiary = (beneficiary: Beneficiary) => {
    setBeneficiaries((current) => {
      const exists = current.some((item) => item.id === beneficiary.id);
      return exists
        ? current.map((item) => (item.id === beneficiary.id ? beneficiary : item))
        : [beneficiary, ...current];
    });
  };

  const deleteBeneficiary = (id: string) => {
    setBeneficiaries((current) => current.filter((item) => item.id !== id));
  };

  if (completed) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <AppBar title="Transfer Receipt" showBack={false} showNotifications={false} />
        <TransferReceipt completed={completed} onDone={() => navigate({ to: "/dashboard" })} />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <AppBar title="Transfers" showBack />

      <div className="sticky top-14 z-20 border-b border-border bg-card px-2">
        <div className="scrollbar-hide flex overflow-x-auto">
          {(["bcb", "interbank", "momo", "account-wallet", "wallet-account"] as TabId[]).map((item) => {
            const itemMeta = tabMeta(item);
            return (
              <button
                key={item}
                type="button"
                className={cn(
                  "flex min-w-[92px] flex-1 flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-smooth",
                  tab === item ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => {
                  setTab(item);
                  setTouched(false);
                }}
              >
                {itemMeta.icon}
                <span>{itemMeta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-4 px-4 py-5">
        {!isWalletTransfer(tab) && (
          <BeneficiaryManager
            beneficiaries={beneficiaries}
            activeType={tab}
            onUse={useBeneficiary}
            onSave={saveBeneficiary}
            onDelete={deleteBeneficiary}
          />
        )}

        <div className="rounded-3xl bg-card p-5 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {meta.icon}
            </div>
            <div>
              <h2 className="font-display font-semibold">{meta.label}</h2>
              <p className="text-xs text-muted-foreground">{meta.helper}</p>
            </div>
          </div>

          <div className="space-y-4">
            {isWalletTransfer(tab) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Account
                  </p>
                  <p className="mt-1 font-display text-sm font-bold text-foreground">
                    {formatGHS(currentBalance)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Wallet
                  </p>
                  <p className="mt-1 font-display text-sm font-bold text-foreground">
                    {formatGHS(walletBalance)}
                  </p>
                </div>
              </div>
            )}

            {tab === "interbank" && (
              <div className="space-y-1.5">
                <Label htmlFor="bank">Destination Bank</Label>
                <select
                  id="bank"
                  value={form.bank}
                  onChange={(event) => updateField("bank", event.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {BANKS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            )}

            {tab === "momo" && (
              <div className="space-y-1.5">
                <Label htmlFor="provider">Network Provider</Label>
                <select
                  id="provider"
                  value={form.provider}
                  onChange={(event) => updateField("provider", event.target.value)}
                  className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
                <div className="flex gap-2 pt-2">
                  {PROVIDERS.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => updateField("provider", provider)}
                      className={cn(
                        "rounded-2xl border p-1 transition-smooth",
                        form.provider === provider ? "border-primary bg-primary/5" : "border-border bg-background",
                      )}
                      aria-label={`Select ${provider}`}
                    >
                      <BrandLogo brand={PROVIDER_BRANDS[provider]} compact />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isWalletTransfer(tab) && (
              <div className="space-y-1.5">
                <Label htmlFor="destination">
                  {tab === "momo" ? "Mobile Number" : "Recipient Account Number"}
                </Label>
                <Input
                  id="destination"
                  value={tab === "momo" ? form.phone : form.account}
                  onChange={(event) => updateField(tab === "momo" ? "phone" : "account", event.target.value)}
                  placeholder={tab === "momo" ? "0241234567" : "Enter account number"}
                  className="h-12"
                />
                <FieldError message={touched ? (tab === "momo" ? errors.phone : errors.account) : undefined} />
              </div>
            )}

            {!isWalletTransfer(tab) && (
              <div className="space-y-1.5">
                <Label htmlFor="recipient">Recipient Name</Label>
                <Input
                  id="recipient"
                  value={form.recipientName}
                  onChange={(event) => updateField("recipientName", event.target.value)}
                  placeholder="Enter recipient name"
                  className="h-12"
                />
                <FieldError message={touched ? errors.recipientName : undefined} />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  GHS
                </span>
                <Input
                  id="amount"
                  value={form.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  placeholder="0.00"
                  className="h-12 pl-14"
                  inputMode="decimal"
                />
              </div>
              <FieldError message={touched ? errors.amount ?? errors.balance : undefined} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="description"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="e.g. Rent payment"
                className="h-12"
              />
            </div>

            <Button className="w-full" onClick={handleContinue}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmPayload && (
          <ConfirmSheet
            payload={confirmPayload}
            busy={busy}
            onCancel={() => !busy && setConfirmPayload(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>

      <PinConfirmDialog
        open={pinOpen}
        title="Confirm Transfer PIN"
        description="Enter your 4-digit PIN to authorize this transfer."
        confirmLabel="Authorize Transfer"
        busy={busy}
        onOpenChange={setPinOpen}
        onConfirm={handlePinConfirmed}
      />
    </div>
  );
}
