import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Eye, EyeOff, IdCard, Loader2, LockKeyhole, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface FormState {
  fullName: string;
  accountNumber: string;
  email: string;
  ghanaCard: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    accountNumber: "",
    email: "",
    ghanaCard: "",
    password: "",
    confirmPassword: "",
  });

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: field === "accountNumber" ? value.replace(/\D/g, "").slice(0, 12) : value,
    }));
  }

  async function handleRegister() {
    if (!form.fullName.trim()) {
      toast.error("Enter your full name.");
      return;
    }
    if (!form.accountNumber.trim()) {
      toast.error("Enter your account number.");
      return;
    }
    if (!form.password.trim()) {
      toast.error("Create a password.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success("Registration ready");
    navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center desktop-bg">
      <div className="mobile-frame flex flex-col overflow-y-auto bg-background shadow-elevated" data-ocid="register.page">
        <div className="relative overflow-hidden px-5 pb-9 pt-12 text-primary-foreground bcb-card-gradient">
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="relative z-10 mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-smooth hover:bg-white/20"
            aria-label="Back to login"
            data-ocid="register.back_button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
              <img src="/assets/bcb-logo.png" alt="BCB" className="h-11 w-11 object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-80">BCB Digital</p>
              <h1 className="font-display text-2xl font-bold">Register Account</h1>
              <p className="mt-1 text-sm opacity-85">Use your account number and password</p>
            </div>
          </div>

          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="-mt-5 flex-1 space-y-4 rounded-t-[2rem] bg-background px-6 pb-10 pt-8"
        >
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
            Demo mode is active. You can enter any account number and password to register the screen flow.
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-name"
                value={form.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                placeholder="Customer full name"
                className="h-12 bg-muted/40 pl-10"
                data-ocid="register.full_name_input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-account">Account Number</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-account"
                value={form.accountNumber}
                onChange={(event) => update("accountNumber", event.target.value)}
                placeholder="Enter account number"
                inputMode="numeric"
                autoComplete="username"
                className="h-12 bg-muted/40 pl-10"
                data-ocid="register.account_number_input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="you@example.com"
                type="email"
                className="h-12 bg-muted/40 pl-10"
                data-ocid="register.email_input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-ghana-card">Ghana Card Number</Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-ghana-card"
                value={form.ghanaCard}
                onChange={(event) => update("ghanaCard", event.target.value)}
                placeholder="GHA-XXXXXXXXX-X"
                className="h-12 bg-muted/40 pl-10"
                data-ocid="register.ghana_card_input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-password">Password</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                autoComplete="new-password"
                className="h-12 bg-muted/40 pl-10 pr-12"
                data-ocid="register.password_input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="register-confirm-password">Confirm Password</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-confirm-password"
                value={form.confirmPassword}
                onChange={(event) => update("confirmPassword", event.target.value)}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat password"
                autoComplete="new-password"
                className="h-12 bg-muted/40 pl-10 pr-12"
                data-ocid="register.confirm_password_input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-xs font-medium text-destructive">Passwords do not match.</p>
            )}
          </div>

          <Button
            className="h-12 w-full rounded-xl font-display text-base font-semibold"
            onClick={handleRegister}
            disabled={loading}
            data-ocid="register.submit_button"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account
              </span>
            ) : (
              "Create Demo Account"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary" data-ocid="register.login_link">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
