import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Phone, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ResetStep = "identify" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ResetStep>("identify");
  const [accountNumber, setAccountNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = useMemo(() => {
    if (step === "identify") return Boolean(accountNumber.trim() && phone.trim());
    if (step === "otp") return /^\d{6}$/.test(otp);
    if (step === "password") return Boolean(password && password === confirmPassword);
    return true;
  }, [accountNumber, confirmPassword, otp, password, phone, step]);

  async function continueFlow() {
    if (!canContinue) {
      toast.error("Complete the required fields before continuing.");
      return;
    }

    setLoading(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 700));
    setLoading(false);

    if (step === "identify") {
      toast.success("OTP sent", { description: "Demo mode accepts any 6 digits." });
      setStep("otp");
    } else if (step === "otp") {
      setStep("password");
    } else if (step === "password") {
      toast.success("Password reset complete");
      setStep("done");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center desktop-bg">
      <div className="mobile-frame flex flex-col bg-background shadow-elevated" data-ocid="forgot.page">
        <div className="relative overflow-hidden px-6 pb-10 pt-12 text-primary-foreground bcb-card-gradient">
          <button
            type="button"
            onClick={() => (step === "identify" ? navigate({ to: "/login" }) : setStep("identify"))}
            data-ocid="forgot.back_button"
            className="relative z-10 mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-smooth hover:bg-white/20"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
            <img src="/assets/bcb-logo.png" alt="BCB" className="h-10 w-10 object-contain" />
          </div>

          <h1 className="relative z-10 mt-5 font-display text-2xl font-bold">Reset Password</h1>
          <p className="relative z-10 mt-2 max-w-xs text-sm opacity-85">
            Verify account ownership, confirm OTP, then create a new password.
          </p>
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="-mt-5 flex flex-1 flex-col rounded-t-[2rem] bg-background px-6 pb-10 pt-10"
        >
          {step === "identify" && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="reset-account">Account Number</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-account"
                    data-ocid="forgot.account_number_input"
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 12))}
                    placeholder="Enter account number"
                    inputMode="numeric"
                    className="h-12 bg-muted/40 pl-10 text-base"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reset-phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-phone"
                    data-ocid="forgot.phone_input"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="0241234567"
                    inputMode="tel"
                    className="h-12 bg-muted/40 pl-10 text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">OTP verification</p>
                    <p className="mt-1 text-xs text-muted-foreground">Enter any 6 digits for demo verification.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reset-otp">OTP Code</Label>
                <Input
                  id="reset-otp"
                  data-ocid="forgot.otp_input"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                  className="h-14 text-center text-xl font-bold tracking-[0.45em]"
                />
              </div>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="new-password"
                    data-ocid="forgot.new_password_input"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create new password"
                    className="h-12 bg-muted/40 pl-10 pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  data-ocid="forgot.confirm_password_input"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  placeholder="Repeat new password"
                  className="h-12 bg-muted/40"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs font-medium text-destructive">Passwords do not match.</p>
                )}
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center" data-ocid="forgot.success_state">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Password Updated</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  You can now sign in with your account number and new password.
                </p>
              </div>
              <Button className="mt-2 h-12 w-full" onClick={() => navigate({ to: "/login" })}>
                Back to Login
              </Button>
            </div>
          )}

          {step !== "done" && (
            <>
              <Button className="mt-7 h-12 w-full rounded-xl font-display text-base font-semibold" onClick={continueFlow} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link to="/login" className="font-semibold text-primary" data-ocid="forgot.login_link">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
