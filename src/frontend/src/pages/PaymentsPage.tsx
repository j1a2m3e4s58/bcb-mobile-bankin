import { AppBar } from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatGHS } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Loader2,
  Radio,
  Shield,
  Smartphone,
  Tv,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CategoryId = "utilities" | "tv" | "airtime" | "insurance";
type ServiceId = "ecg" | "water" | "dstv" | "gotv";
type Network = "MTN" | "Vodafone" | "AirtelTigo";
type Screen = "home" | "category" | "form" | "confirm" | "success";

interface Service {
  id: ServiceId;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  iconBg: string;
  borderColor: string;
  categoryId: CategoryId;
}

interface PayState {
  serviceId: ServiceId | null;
  reference: string;
  amount: string;
  network: Network;
  tvPackage: string;
  dataBundle: string;
  isDataMode: boolean;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "utilities" as CategoryId,
    label: "Utilities",
    description: "ECG, Water bills",
    Icon: Zap,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800/50",
    iconBg: "bg-blue-100 dark:bg-blue-900/60",
  },
  {
    id: "tv" as CategoryId,
    label: "TV Subscriptions",
    description: "DStv, GOtv packages",
    Icon: Tv,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800/50",
    iconBg: "bg-purple-100 dark:bg-purple-900/60",
  },
  {
    id: "airtime" as CategoryId,
    label: "Airtime & Data",
    description: "MTN, Vodafone, AirtelTigo",
    Icon: Smartphone,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200 dark:border-orange-800/50",
    iconBg: "bg-orange-100 dark:bg-orange-900/60",
  },
  {
    id: "insurance" as CategoryId,
    label: "Insurance",
    description: "Premiums & renewals",
    Icon: Shield,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/40",
    border: "border-slate-200 dark:border-slate-700/50",
    iconBg: "bg-slate-100 dark:bg-slate-800/60",
  },
];

const SERVICES: Service[] = [
  {
    id: "ecg",
    name: "ECG Electricity",
    description:
      "Electricity Company of Ghana — prepaid & postpaid meter top-up",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    borderColor: "border-amber-200 dark:border-amber-800/40",
    categoryId: "utilities",
  },
  {
    id: "water",
    name: "Ghana Water",
    description: "Ghana Water Company Ltd — water bill payments",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    borderColor: "border-blue-200 dark:border-blue-800/40",
    categoryId: "utilities",
  },
  {
    id: "dstv",
    name: "DStv",
    description: "Pay your DStv subscription to keep entertainment going",
    color: "text-blue-800 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    borderColor: "border-blue-200 dark:border-blue-800/40",
    categoryId: "tv",
  },
  {
    id: "gotv",
    name: "GOtv",
    description: "Renew your GOtv subscription for uninterrupted viewing",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/40",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    borderColor: "border-green-200 dark:border-green-800/40",
    categoryId: "tv",
  },
];

const DSTV_PACKAGES = [
  { name: "Padi", price: 25 },
  { name: "Yethu", price: 45 },
  { name: "Compact", price: 120 },
  { name: "Premium", price: 200 },
];

const GOTV_PACKAGES = [
  { name: "Lite", price: 15 },
  { name: "Value", price: 30 },
  { name: "Plus", price: 55 },
  { name: "Max", price: 75 },
];

const ECG_PRESETS = [20, 50, 100, 200];
const AIRTIME_PRESETS = [1, 2, 5, 10, 20, 50];

const DATA_BUNDLES: Record<Network, { label: string; price: number }[]> = {
  MTN: [
    { label: "1GB / 24hrs", price: 5 },
    { label: "3GB / 7days", price: 12 },
    { label: "5GB / 30days", price: 25 },
    { label: "10GB / 30days", price: 45 },
    { label: "20GB / 30days", price: 80 },
    { label: "50GB / 30days", price: 150 },
  ],
  Vodafone: [
    { label: "1GB / 24hrs", price: 5 },
    { label: "2.5GB / 7days", price: 10 },
    { label: "6GB / 30days", price: 25 },
    { label: "12GB / 30days", price: 45 },
    { label: "25GB / 30days", price: 80 },
    { label: "60GB / 30days", price: 150 },
  ],
  AirtelTigo: [
    { label: "1GB / 24hrs", price: 4 },
    { label: "3GB / 7days", price: 11 },
    { label: "5GB / 30days", price: 22 },
    { label: "10GB / 30days", price: 40 },
    { label: "22GB / 30days", price: 75 },
    { label: "55GB / 30days", price: 140 },
  ],
};

const NETWORK_STYLES: Record<
  Network,
  { text: string; bg: string; border: string }
> = {
  MTN: {
    text: "text-yellow-700 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    border: "border-yellow-400 dark:border-yellow-600",
  },
  Vodafone: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-400 dark:border-red-600",
  },
  AirtelTigo: {
    text: "text-rose-700 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-400 dark:border-rose-600",
  },
};

function generateRef(): string {
  return `BCB${Math.floor(1_000_000_000 + Math.random() * 9_000_000_000).toString()}`;
}

// ─── Small shared atoms ────────────────────────────────────────────────────

function ServiceIconAtom({ id }: { id: ServiceId }) {
  if (id === "ecg")
    return <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
  if (id === "water")
    return <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
  if (id === "dstv")
    return <Tv className="w-6 h-6 text-blue-700 dark:text-blue-400" />;
  return <Radio className="w-6 h-6 text-green-600 dark:text-green-400" />;
}

function PresetGrid({
  presets,
  selected,
  onSelect,
}: {
  presets: number[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {presets.map((p) => (
        <button
          key={p}
          type="button"
          data-ocid={`payments.preset.${p}`}
          onClick={() => onSelect(String(p))}
          className={cn(
            "py-2.5 rounded-xl border-2 text-sm font-semibold transition-smooth",
            selected === String(p)
              ? "border-primary bg-primary/8 text-primary"
              : "border-border text-muted-foreground bg-card",
          )}
        >
          {formatGHS(p)}
        </button>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successRef, setSuccessRef] = useState("");

  const [pay, setPay] = useState<PayState>({
    serviceId: null,
    reference: "",
    amount: "",
    network: "MTN",
    tvPackage: "",
    dataBundle: "",
    isDataMode: false,
  });

  const update = useCallback((patch: Partial<PayState>) => {
    setPay((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetPay = () => {
    setPay({
      serviceId: null,
      reference: "",
      amount: "",
      network: "MTN",
      tvPackage: "",
      dataBundle: "",
      isDataMode: false,
    });
  };

  const svc = SERVICES.find((s) => s.id === pay.serviceId) ?? null;

  const computedAmount = (): number => {
    if (pay.serviceId === "dstv") {
      return DSTV_PACKAGES.find((p) => p.name === pay.tvPackage)?.price ?? 0;
    }
    if (pay.serviceId === "gotv") {
      return GOTV_PACKAGES.find((p) => p.name === pay.tvPackage)?.price ?? 0;
    }
    if (pay.isDataMode && pay.dataBundle) {
      return (
        DATA_BUNDLES[pay.network].find((b) => b.label === pay.dataBundle)
          ?.price ?? 0
      );
    }
    return Number.parseFloat(pay.amount) || 0;
  };

  const formValid = (): boolean => {
    if (!pay.reference.trim()) return false;
    if (pay.serviceId === "dstv" || pay.serviceId === "gotv")
      return !!pay.tvPackage;
    if (activeCategory === "airtime" && pay.isDataMode) return !!pay.dataBundle;
    return !!pay.amount && Number.parseFloat(pay.amount) > 0;
  };

  const airtimeValid = (): boolean => {
    if (!pay.reference.trim()) return false;
    if (pay.isDataMode) return !!pay.dataBundle;
    return !!pay.amount && Number.parseFloat(pay.amount) > 0;
  };

  const isValid = activeCategory === "airtime" ? airtimeValid() : formValid();

  const handleSelectCategory = (id: CategoryId) => {
    setActiveCategory(id);
    resetPay();
    if (id === "airtime") {
      setScreen("form");
    } else {
      setScreen("category");
    }
  };

  const handleSelectService = (id: ServiceId) => {
    update({
      serviceId: id,
      reference: "",
      amount: "",
      tvPackage: "",
      dataBundle: "",
    });
    setScreen("form");
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setScreen("confirm");
  };

  const handleConfirmPay = async () => {
    setIsLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1600));
    setIsLoading(false);
    setSuccessRef(generateRef());
    setScreen("success");
  };

  const handleDone = () => {
    setScreen("home");
    setActiveCategory(null);
    resetPay();
  };

  // AppBar meta
  const catMeta = CATEGORIES.find((c) => c.id === activeCategory);
  const appBarTitle =
    screen === "success"
      ? "Payment Successful"
      : screen === "confirm"
        ? "Confirm Payment"
        : screen === "form" && svc
          ? svc.name
          : screen === "form" && activeCategory === "airtime"
            ? "Airtime & Data"
            : screen === "category"
              ? (catMeta?.label ?? "Payments")
              : "Payments";

  const showBack = screen !== "home";
  const totalAmount = computedAmount();

  const serviceName =
    svc?.name ??
    (activeCategory === "airtime"
      ? `${pay.network} ${pay.isDataMode ? "Data" : "Airtime"}`
      : "Payment");

  const refLabel =
    pay.serviceId === "ecg"
      ? "Meter Number"
      : pay.serviceId === "water"
        ? "Account Number"
        : pay.serviceId === "dstv" || pay.serviceId === "gotv"
          ? "Smart Card"
          : "Phone Number";

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppBar
        title={appBarTitle}
        showBack={showBack}
        showNotifications={false}
        rightSlot={
          showBack && screen !== "success" ? (
            <button
              type="button"
              data-ocid="payments.cancel_button"
              onClick={handleDone}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5"
            >
              Cancel
            </button>
          ) : undefined
        }
      />

      <AnimatePresence mode="wait">
        {/* ━━━ HOME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {screen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="flex-1 px-4 pt-5 pb-10"
          >
            <p className="text-sm text-muted-foreground mb-5">
              Pay bills, buy airtime, renew subscriptions and more
            </p>

            {/* Category grid */}
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(
                (
                  { id, label, description, Icon, color, bg, border, iconBg },
                  i,
                ) => (
                  <motion.button
                    key={id}
                    type="button"
                    data-ocid={`payments.category.${id}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    onClick={() => handleSelectCategory(id)}
                    className={cn(
                      "flex flex-col items-start gap-3 rounded-2xl p-4 border text-left",
                      "active:scale-[0.97] transition-smooth shadow-card hover:shadow-elevated",
                      bg,
                      border,
                    )}
                  >
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center",
                        iconBg,
                      )}
                    >
                      <Icon className={cn("w-5 h-5", color)} />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold font-display",
                          color,
                        )}
                      >
                        {label}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {description}
                      </p>
                    </div>
                  </motion.button>
                ),
              )}
            </div>

            {/* Quick-access airtime shortcut */}
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-foreground font-display mb-3">
                Quick Actions
              </h2>
              <motion.button
                type="button"
                data-ocid="payments.quick_airtime_button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.3 }}
                onClick={() => handleSelectCategory("airtime")}
                className="w-full flex items-center gap-4 bg-card rounded-2xl p-4 shadow-card border border-border active:scale-[0.98] transition-smooth hover:shadow-elevated text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground font-display">
                    Buy Airtime / Data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MTN • Vodafone • AirtelTigo
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ━━━ CATEGORY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {screen === "category" &&
          activeCategory &&
          activeCategory !== "airtime" && (
            <motion.div
              key={`cat-${activeCategory}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="flex-1 px-4 pt-5 pb-10"
              data-ocid={`payments.${activeCategory}_section`}
            >
              <p className="text-sm text-muted-foreground mb-4">
                {activeCategory === "utilities" &&
                  "Choose a utility provider to pay your bill"}
                {activeCategory === "tv" &&
                  "Select your TV subscription provider to renew"}
                {activeCategory === "insurance" &&
                  "Manage your insurance premium payments"}
              </p>
              <div className="flex flex-col gap-3">
                {activeCategory === "insurance" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 py-16 text-center"
                    data-ocid="payments.insurance.empty_state"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Coming Soon
                    </p>
                    <p className="text-xs text-muted-foreground/70 max-w-48">
                      Insurance premium payments will be available in a future
                      update.
                    </p>
                  </motion.div>
                ) : (
                  SERVICES.filter((s) => s.categoryId === activeCategory).map(
                    (service, i) => (
                      <motion.button
                        key={service.id}
                        type="button"
                        data-ocid={`payments.service.${service.id}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.28 }}
                        onClick={() => handleSelectService(service.id)}
                        className={cn(
                          "w-full flex items-center gap-4 rounded-2xl p-4 border text-left",
                          "active:scale-[0.98] transition-smooth shadow-card hover:shadow-elevated",
                          service.bgColor,
                          service.borderColor,
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center",
                            service.iconBg,
                          )}
                        >
                          <ServiceIconAtom id={service.id} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-semibold font-display",
                              service.color,
                            )}
                          >
                            {service.name}
                          </p>
                          <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </motion.button>
                    ),
                  )
                )}
              </div>
            </motion.div>
          )}

        {/* ━━━ FORM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {screen === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="flex-1 px-4 pt-4 pb-10"
          >
            {/* Service header badge */}
            {svc && (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-2xl p-4 mb-5 border",
                  svc.bgColor,
                  svc.borderColor,
                )}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                    svc.iconBg,
                  )}
                >
                  <ServiceIconAtom id={svc.id} />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold font-display",
                      svc.color,
                    )}
                  >
                    {svc.name}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                    {svc.description}
                  </p>
                </div>
              </div>
            )}
            {activeCategory === "airtime" && !svc && (
              <div className="flex items-center gap-3 rounded-2xl p-4 mb-5 border bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/40">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-100 dark:bg-orange-900/50">
                  <Smartphone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-display text-orange-700 dark:text-orange-400">
                    Airtime & Data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Select network and enter amount
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmitForm}
              className="flex flex-col gap-5"
              data-ocid="payments.form"
            >
              {/* ──── AIRTIME / DATA ──── */}
              {activeCategory === "airtime" && (
                <>
                  {/* Network */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">
                      Network Provider
                    </Label>
                    <div className="flex gap-2">
                      {(["MTN", "Vodafone", "AirtelTigo"] as Network[]).map(
                        (n) => {
                          const s = NETWORK_STYLES[n];
                          return (
                            <button
                              key={n}
                              type="button"
                              data-ocid={`payments.network.${n.toLowerCase()}`}
                              onClick={() =>
                                update({
                                  network: n,
                                  dataBundle: "",
                                  amount: "",
                                })
                              }
                              className={cn(
                                "flex-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-smooth",
                                pay.network === n
                                  ? cn(s.bg, s.border, s.text)
                                  : "border-border text-muted-foreground bg-card",
                              )}
                            >
                              {n}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Phone number */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="airtime-phone"
                      className="text-sm font-semibold"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="airtime-phone"
                      type="tel"
                      placeholder="e.g. 0241234567"
                      value={pay.reference}
                      onChange={(e) => update({ reference: e.target.value })}
                      className="h-12 text-base"
                      maxLength={10}
                      data-ocid="payments.phone_input"
                    />
                  </div>

                  {/* Airtime / Data toggle */}
                  <div className="flex bg-muted rounded-xl p-1 gap-1">
                    <button
                      type="button"
                      data-ocid="payments.airtime_tab"
                      onClick={() =>
                        update({
                          isDataMode: false,
                          dataBundle: "",
                          amount: "",
                        })
                      }
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-semibold transition-smooth",
                        !pay.isDataMode
                          ? "bg-card shadow-card text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      Airtime
                    </button>
                    <button
                      type="button"
                      data-ocid="payments.data_tab"
                      onClick={() => update({ isDataMode: true, amount: "" })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-semibold transition-smooth",
                        pay.isDataMode
                          ? "bg-card shadow-card text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      Data
                    </button>
                  </div>

                  {/* Airtime presets */}
                  {!pay.isDataMode && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-semibold">
                        Select Amount
                      </Label>
                      <PresetGrid
                        presets={AIRTIME_PRESETS}
                        selected={pay.amount}
                        onSelect={(v) => update({ amount: v })}
                      />
                      <Label
                        htmlFor="airtime-custom"
                        className="text-xs text-muted-foreground mt-1"
                      >
                        Or enter custom amount
                      </Label>
                      <Input
                        id="airtime-custom"
                        type="number"
                        placeholder="Custom amount (GHS)"
                        value={
                          AIRTIME_PRESETS.includes(Number(pay.amount))
                            ? ""
                            : pay.amount
                        }
                        onChange={(e) => update({ amount: e.target.value })}
                        className="h-11"
                        min="1"
                        data-ocid="payments.custom_amount_input"
                      />
                    </div>
                  )}

                  {/* Data bundles */}
                  {pay.isDataMode && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-semibold">
                        Data Bundles — {pay.network}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {DATA_BUNDLES[pay.network].map((b, i) => (
                          <button
                            key={b.label}
                            type="button"
                            data-ocid={`payments.bundle.${i + 1}`}
                            onClick={() => update({ dataBundle: b.label })}
                            className={cn(
                              "flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-smooth text-center",
                              pay.dataBundle === b.label
                                ? "border-primary bg-primary/8 text-primary"
                                : "border-border text-muted-foreground bg-card",
                            )}
                          >
                            <span className="text-xs font-semibold leading-tight">
                              {b.label}
                            </span>
                            <span
                              className={cn(
                                "text-sm font-bold mt-1",
                                pay.dataBundle === b.label
                                  ? "text-primary"
                                  : "text-foreground",
                              )}
                            >
                              {formatGHS(b.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ──── ECG / WATER ──── */}
              {(pay.serviceId === "ecg" || pay.serviceId === "water") && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="utility-ref"
                      className="text-sm font-semibold"
                    >
                      {pay.serviceId === "ecg"
                        ? "Meter Number"
                        : "Account Number"}
                    </Label>
                    <Input
                      id="utility-ref"
                      placeholder={
                        pay.serviceId === "ecg"
                          ? "Enter ECG meter number"
                          : "Enter water account number"
                      }
                      value={pay.reference}
                      onChange={(e) => update({ reference: e.target.value })}
                      className="h-12 text-base"
                      data-ocid="payments.reference_input"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">
                      Select Amount
                    </Label>
                    <PresetGrid
                      presets={ECG_PRESETS}
                      selected={pay.amount}
                      onSelect={(v) => update({ amount: v })}
                    />
                    <Label
                      htmlFor="utility-custom"
                      className="text-xs text-muted-foreground mt-1"
                    >
                      Or enter custom amount
                    </Label>
                    <Input
                      id="utility-custom"
                      type="number"
                      placeholder="Custom amount (GHS)"
                      value={
                        ECG_PRESETS.includes(Number(pay.amount))
                          ? ""
                          : pay.amount
                      }
                      onChange={(e) => update({ amount: e.target.value })}
                      className="h-11"
                      min="1"
                      data-ocid="payments.custom_amount_input"
                    />
                  </div>
                </>
              )}

              {/* ──── DSTV ──── */}
              {pay.serviceId === "dstv" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="dstv-card"
                      className="text-sm font-semibold"
                    >
                      Smart Card Number
                    </Label>
                    <Input
                      id="dstv-card"
                      placeholder="Enter DStv smart card number"
                      value={pay.reference}
                      onChange={(e) => update({ reference: e.target.value })}
                      className="h-12 text-base"
                      data-ocid="payments.reference_input"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">
                      Select Package
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {DSTV_PACKAGES.map((p, i) => (
                        <button
                          key={p.name}
                          type="button"
                          data-ocid={`payments.dstv_package.${i + 1}`}
                          onClick={() => update({ tvPackage: p.name })}
                          className={cn(
                            "flex flex-col items-center py-3 rounded-xl border-2 transition-smooth",
                            pay.tvPackage === p.name
                              ? "border-primary bg-primary/8 text-primary"
                              : "border-border text-muted-foreground bg-card",
                          )}
                        >
                          <span className="text-xs font-semibold">
                            DStv {p.name}
                          </span>
                          <span
                            className={cn(
                              "text-sm font-bold mt-0.5",
                              pay.tvPackage === p.name
                                ? "text-primary"
                                : "text-foreground",
                            )}
                          >
                            {formatGHS(p.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ──── GOTV ──── */}
              {pay.serviceId === "gotv" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="gotv-card"
                      className="text-sm font-semibold"
                    >
                      Smart Card Number
                    </Label>
                    <Input
                      id="gotv-card"
                      placeholder="Enter GOtv smart card number"
                      value={pay.reference}
                      onChange={(e) => update({ reference: e.target.value })}
                      className="h-12 text-base"
                      data-ocid="payments.reference_input"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">
                      Select Package
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {GOTV_PACKAGES.map((p, i) => (
                        <button
                          key={p.name}
                          type="button"
                          data-ocid={`payments.gotv_package.${i + 1}`}
                          onClick={() => update({ tvPackage: p.name })}
                          className={cn(
                            "flex flex-col items-center py-3 rounded-xl border-2 transition-smooth",
                            pay.tvPackage === p.name
                              ? "border-primary bg-primary/8 text-primary"
                              : "border-border text-muted-foreground bg-card",
                          )}
                        >
                          <span className="text-xs font-semibold">
                            GOtv {p.name}
                          </span>
                          <span
                            className={cn(
                              "text-sm font-bold mt-0.5",
                              pay.tvPackage === p.name
                                ? "text-primary"
                                : "text-foreground",
                            )}
                          >
                            {formatGHS(p.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Amount preview */}
              {totalAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-primary/8 rounded-xl px-4 py-3 border border-primary/20"
                >
                  <span className="text-sm text-muted-foreground">
                    Total to pay
                  </span>
                  <span className="text-lg font-bold text-primary font-display">
                    {formatGHS(totalAmount)}
                  </span>
                </motion.div>
              )}

              <Button
                type="submit"
                className="h-12 text-base font-semibold w-full mt-1"
                disabled={!isValid}
                data-ocid="payments.submit_button"
              >
                Continue to Confirm
              </Button>
            </form>
          </motion.div>
        )}

        {/* ━━━ CONFIRM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {screen === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 px-4 pt-4 pb-10 flex flex-col"
            data-ocid="payments.confirm_dialog"
          >
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden flex flex-col">
              {/* Gradient header */}
              <div className="bcb-card-gradient px-5 py-5 text-primary-foreground">
                <p className="text-sm font-medium opacity-80">
                  Payment Summary
                </p>
                <p className="text-3xl font-bold font-display mt-1">
                  {formatGHS(totalAmount)}
                </p>
                <p className="text-sm opacity-70 mt-1">{serviceName}</p>
              </div>

              {/* Details rows */}
              <div className="p-5 flex flex-col gap-3.5">
                {(
                  [
                    { label: "Service", value: serviceName },
                    { label: refLabel, value: pay.reference },
                    pay.tvPackage
                      ? { label: "Package", value: pay.tvPackage }
                      : null,
                    pay.isDataMode && pay.dataBundle
                      ? { label: "Bundle", value: pay.dataBundle }
                      : null,
                    { label: "Amount", value: formatGHS(totalAmount) },
                  ] as Array<{ label: string; value: string } | null>
                )
                  .filter(Boolean)
                  .map(
                    (row) =>
                      row && (
                        <div
                          key={row.label}
                          className="flex items-center justify-between py-1 border-b border-border last:border-0"
                        >
                          <span className="text-sm text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="text-sm font-semibold text-foreground text-right max-w-[55%] break-all">
                            {row.value}
                          </span>
                        </div>
                      ),
                  )}
              </div>

              <div className="px-5 pb-2">
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/60 rounded-xl p-3">
                  By tapping <strong>Pay Now</strong>, you authorise BCB to
                  debit your account. Transactions are processed immediately and
                  cannot be reversed.
                </p>
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 pt-4 flex flex-col gap-3">
                <Button
                  type="button"
                  className="h-12 text-base font-semibold w-full"
                  onClick={handleConfirmPay}
                  disabled={isLoading}
                  data-ocid="payments.confirm_button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    `Pay ${formatGHS(totalAmount)}`
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => setScreen("form")}
                  disabled={isLoading}
                  data-ocid="payments.back_button"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ━━━ SUCCESS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {screen === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 px-4 pt-8 pb-10 flex flex-col items-center"
            data-ocid="payments.success_state"
          >
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 220,
                damping: 14,
              }}
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
            >
              <CheckCircle2
                className="w-14 h-14 text-primary"
                strokeWidth={1.5}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold font-display text-foreground">
                Payment Successful
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Your payment has been processed successfully
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-card rounded-2xl border border-border shadow-card p-5 flex flex-col gap-3 mb-8"
            >
              {(
                [
                  { label: "Service", value: serviceName },
                  {
                    label: "Amount Paid",
                    value: formatGHS(totalAmount),
                    highlight: true,
                  },
                  pay.tvPackage
                    ? { label: "Package", value: pay.tvPackage }
                    : null,
                  pay.isDataMode && pay.dataBundle
                    ? { label: "Bundle", value: pay.dataBundle }
                    : null,
                  { label: "Reference", value: successRef },
                  {
                    label: "Date",
                    value: new Date().toLocaleString("en-GH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }),
                  },
                ] as Array<{
                  label: string;
                  value: string;
                  highlight?: boolean;
                } | null>
              )
                .filter(Boolean)
                .map(
                  (row) =>
                    row && (
                      <div
                        key={row.label}
                        className="flex items-start justify-between py-1 border-b border-border last:border-0"
                      >
                        <span className="text-sm text-muted-foreground flex-shrink-0">
                          {row.label}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-semibold text-right max-w-[58%] break-all",
                            row.highlight ? "text-primary" : "text-foreground",
                          )}
                        >
                          {row.value}
                        </span>
                      </div>
                    ),
                )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
              className="w-full"
            >
              <Button
                type="button"
                className="h-12 w-full text-base font-semibold"
                onClick={handleDone}
                data-ocid="payments.done_button"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
