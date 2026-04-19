import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRANCHES } from "@/lib/support-data";
import { type AccountType, useAuthStore } from "@/store/auth-store";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  FileUp,
  Home,
  IdCard,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Step = "identity" | "account" | "uploads" | "otp" | "pin";

interface OnboardingForm {
  fullName: string;
  phone: string;
  email: string;
  ghanaCard: string;
  dateOfBirth: string;
  residentialAddress: string;
  occupation: string;
  nextOfKin: string;
  branch: string;
  accountType: AccountType;
  password: string;
  confirmPassword: string;
  otp: string;
  transactionPin: string;
  confirmTransactionPin: string;
  ghanaCardFrontUploaded: boolean;
  ghanaCardBackUploaded: boolean;
  selfieUploaded: boolean;
}

const ACCOUNT_TYPES: AccountType[] = [
  "Savings Account",
  "Current Account",
  "Student Account",
  "Business Account",
  "Susu / Group Savings",
];

const STEPS: { id: Step; label: string }[] = [
  { id: "identity", label: "KYC" },
  { id: "account", label: "Account" },
  { id: "uploads", label: "Verify" },
  { id: "otp", label: "OTP" },
  { id: "pin", label: "PIN" },
];

const initialForm: OnboardingForm = {
  fullName: "",
  phone: "",
  email: "",
  ghanaCard: "",
  dateOfBirth: "",
  residentialAddress: "",
  occupation: "",
  nextOfKin: "",
  branch: BRANCHES[0]?.name ?? "Bawjiase Market Branch",
  accountType: "Savings Account",
  password: "",
  confirmPassword: "",
  otp: "",
  transactionPin: "",
  confirmTransactionPin: "",
  ghanaCardFrontUploaded: false,
  ghanaCardBackUploaded: false,
  selfieUploaded: false,
};

function FieldIcon({ children }: { children: React.ReactNode }) {
  return <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{children}</span>;
}

function ProgressSteps({ step }: { step: Step }) {
  const activeIndex = STEPS.findIndex((item) => item.id === step);
  return (
    <div className="flex gap-2">
      {STEPS.map((item, index) => (
        <div key={item.id} className="min-w-0 flex-1">
          <div
            className={
              index <= activeIndex
                ? "h-1.5 rounded-full bg-primary"
                : "h-1.5 rounded-full bg-border"
            }
          />
          <p className="mt-1 truncate text-center text-[10px] font-medium text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function UploadPlaceholder({
  label,
  description,
  uploaded,
  onUpload,
}: {
  label: string;
  description: string;
  uploaded: boolean;
  onUpload: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onUpload}
      className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/35 bg-primary/5 p-4 text-left transition-smooth hover:bg-primary/8"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {uploaded ? <CheckCircle2 className="h-5 w-5" /> : <FileUp className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{uploaded ? "Placeholder uploaded" : description}</span>
      </span>
    </button>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerCustomer = useAuthStore((state) => state.registerCustomer);
  const [step, setStep] = useState<Step>("identity");
  const [form, setForm] = useState<OnboardingForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const stepIndex = STEPS.findIndex((item) => item.id === step);
  const nextStep = STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]?.id ?? step;
  const previousStep = STEPS[Math.max(stepIndex - 1, 0)]?.id ?? step;

  const canContinue = useMemo(() => {
    if (step === "identity") {
      return Boolean(
        form.fullName.trim() &&
          form.phone.trim() &&
          form.ghanaCard.trim() &&
          form.dateOfBirth &&
          form.residentialAddress.trim() &&
          form.occupation.trim() &&
          form.nextOfKin.trim(),
      );
    }
    if (step === "account") {
      return Boolean(form.accountType && form.branch && form.password && form.password === form.confirmPassword);
    }
    if (step === "uploads") {
      return true;
    }
    if (step === "otp") {
      return /^\d{6}$/.test(form.otp);
    }
    return /^\d{4}$/.test(form.transactionPin) && form.transactionPin === form.confirmTransactionPin;
  }, [form, step]);

  const update = (field: keyof OnboardingForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const continueFlow = async () => {
    if (!canContinue) {
      toast.error("Complete the required fields before continuing.");
      return;
    }

    if (step !== "pin") {
      setStep(nextStep);
      return;
    }

    setLoading(true);
    const user = await registerCustomer(
      {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        ghanaCard: form.ghanaCard,
        dateOfBirth: form.dateOfBirth,
        residentialAddress: form.residentialAddress,
        occupation: form.occupation,
        nextOfKin: form.nextOfKin,
        branch: form.branch,
        accountType: form.accountType,
        ghanaCardFrontUploaded: form.ghanaCardFrontUploaded,
        ghanaCardBackUploaded: form.ghanaCardBackUploaded,
        selfieUploaded: form.selfieUploaded,
      },
      form.password,
      form.transactionPin,
    );
    setLoading(false);
    toast.success("Account application submitted", {
      description: `${user.accountType} opened for ${user.name}.`,
    });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center desktop-bg">
      <div className="mobile-frame flex flex-col overflow-y-auto bg-background shadow-elevated" data-ocid="register.page">
        <div className="relative overflow-hidden px-5 pb-7 pt-10 text-primary-foreground bcb-card-gradient">
          <button
            type="button"
            onClick={() => (step === "identity" ? navigate({ to: "/login" }) : setStep(previousStep))}
            className="relative z-10 mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-smooth hover:bg-white/20"
            aria-label="Go back"
            data-ocid="register.back_button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
              <img src="/assets/bcb-logo.png" alt="BCB" className="h-11 w-11 object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-80">BCB Onboarding</p>
              <h1 className="font-display text-2xl font-bold">Open Account</h1>
              <p className="mt-1 text-sm opacity-85">KYC, account type, OTP, and PIN</p>
            </div>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="-mt-4 flex-1 rounded-t-[2rem] bg-background px-6 pb-10 pt-7"
        >
          <ProgressSteps step={step} />

          {step === "identity" && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full-name">Full Legal Name</Label>
                  <div className="relative">
                    <FieldIcon><User className="h-4 w-4" /></FieldIcon>
                    <Input id="full-name" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="Customer full legal name" className="h-12 pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <FieldIcon><Phone className="h-4 w-4" /></FieldIcon>
                    <Input id="phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="0241234567" className="h-12 pl-10" inputMode="tel" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ghana-card">Ghana Card Number</Label>
                  <div className="relative">
                    <FieldIcon><IdCard className="h-4 w-4" /></FieldIcon>
                    <Input id="ghana-card" value={form.ghanaCard} onChange={(event) => update("ghanaCard", event.target.value)} placeholder="GHA-XXXXXXXXX-X" className="h-12 pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <div className="relative">
                    <FieldIcon><Calendar className="h-4 w-4" /></FieldIcon>
                    <Input id="dob" value={form.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} type="date" className="h-12 pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">Residential Address</Label>
                  <div className="relative">
                    <FieldIcon><Home className="h-4 w-4" /></FieldIcon>
                    <Input id="address" value={form.residentialAddress} onChange={(event) => update("residentialAddress", event.target.value)} placeholder="House number, town, district" className="h-12 pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="occupation">Occupation</Label>
                  <div className="relative">
                    <FieldIcon><BriefcaseBusiness className="h-4 w-4" /></FieldIcon>
                    <Input id="occupation" value={form.occupation} onChange={(event) => update("occupation", event.target.value)} placeholder="Occupation or business" className="h-12 pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="next-of-kin">Next of Kin</Label>
                  <div className="relative">
                    <FieldIcon><Users className="h-4 w-4" /></FieldIcon>
                    <Input id="next-of-kin" value={form.nextOfKin} onChange={(event) => update("nextOfKin", event.target.value)} placeholder="Name and phone number" className="h-12 pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <FieldIcon><Mail className="h-4 w-4" /></FieldIcon>
                    <Input id="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" className="h-12 pl-10" type="email" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "account" && (
            <div className="mt-6 space-y-5">
              <div>
                <Label>Account Type</Label>
                <div className="mt-2 grid gap-2">
                  {ACCOUNT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update("accountType", type)}
                      className={
                        form.accountType === type
                          ? "rounded-2xl border border-primary bg-primary/8 p-4 text-left text-sm font-semibold text-primary"
                          : "rounded-2xl border border-border bg-card p-4 text-left text-sm font-semibold text-foreground"
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="branch">Preferred Branch</Label>
                <div className="relative">
                  <FieldIcon><MapPin className="h-4 w-4" /></FieldIcon>
                  <select id="branch" value={form.branch} onChange={(event) => update("branch", event.target.value)} className="h-12 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm">
                    {BRANCHES.map((branch) => (
                      <option key={branch.name} value={branch.name}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <FieldIcon><LockKeyhole className="h-4 w-4" /></FieldIcon>
                  <Input id="password" value={form.password} onChange={(event) => update("password", event.target.value)} type={showPassword ? "text" : "password"} placeholder="Create password" className="h-12 pl-10 pr-12" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} type="password" placeholder="Repeat password" className="h-12" />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs font-medium text-destructive">Passwords do not match.</p>
                )}
              </div>
            </div>
          )}

          {step === "uploads" && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-sm font-semibold text-foreground">Document placeholders</p>
                <p className="mt-1 text-xs text-muted-foreground">For demo, tapping upload marks each requirement as provided.</p>
              </div>
              <UploadPlaceholder label="Ghana Card Front" description="Upload front side placeholder" uploaded={form.ghanaCardFrontUploaded} onUpload={() => update("ghanaCardFrontUploaded", true)} />
              <UploadPlaceholder label="Ghana Card Back" description="Upload back side placeholder" uploaded={form.ghanaCardBackUploaded} onUpload={() => update("ghanaCardBackUploaded", true)} />
              <UploadPlaceholder label="Selfie Verification" description="Start selfie verification placeholder" uploaded={form.selfieUploaded} onUpload={() => update("selfieUploaded", true)} />
            </div>
          )}

          {step === "otp" && (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Phone verification</p>
                    <p className="mt-1 text-xs text-muted-foreground">Enter any 6 digits to verify this demo application.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="otp">OTP Code</Label>
                <Input id="otp" value={form.otp} onChange={(event) => update("otp", event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="000000" className="h-14 text-center text-xl font-bold tracking-[0.45em]" />
              </div>
            </div>
          )}

          {step === "pin" && (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-foreground">Create Transaction PIN</p>
                <p className="mt-1 text-xs text-muted-foreground">This 4-digit PIN will authorize transfers, payments, card changes, and loan submissions.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="transaction-pin">Transaction PIN</Label>
                <Input id="transaction-pin" value={form.transactionPin} onChange={(event) => update("transactionPin", event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" type="password" maxLength={4} placeholder="****" className="h-14 text-center text-xl font-bold tracking-[0.45em]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-transaction-pin">Confirm Transaction PIN</Label>
                <Input id="confirm-transaction-pin" value={form.confirmTransactionPin} onChange={(event) => update("confirmTransactionPin", event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" type="password" maxLength={4} placeholder="****" className="h-14 text-center text-xl font-bold tracking-[0.45em]" />
                {form.confirmTransactionPin && form.transactionPin !== form.confirmTransactionPin && (
                  <p className="text-xs font-medium text-destructive">Transaction PINs do not match.</p>
                )}
              </div>
            </div>
          )}

          <Button className="mt-7 h-12 w-full rounded-xl font-display text-base font-semibold" onClick={continueFlow} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating profile
              </span>
            ) : step === "pin" ? (
              "Submit Application"
            ) : (
              <span className="flex items-center gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
