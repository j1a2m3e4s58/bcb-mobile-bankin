import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!accountNumber.trim()) {
      setError("Enter your account number.");
      return;
    }

    if (!password.trim()) {
      setError("Enter your password.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const ok = await login(accountNumber, password);
      if (ok) {
        toast.success("Login successful");
        navigate({ to: "/dashboard" });
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center desktop-bg">
      <div className="mobile-frame flex flex-col overflow-y-auto bg-background shadow-elevated" data-ocid="login.page">
        <div className="relative overflow-hidden px-6 pb-10 pt-14 text-primary-foreground bcb-card-gradient">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 flex items-center gap-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 bg-white/15 shadow-card">
              <img src="/assets/bcb-logo.png" alt="BCB" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] opacity-80">BCB</p>
              <h1 className="font-display text-2xl font-bold">Secure Login</h1>
              <p className="mt-1 text-sm opacity-85">Bawjiase Community Bank</p>
            </div>
          </motion.div>

          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-white/10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="-mt-5 flex flex-1 flex-col gap-5 rounded-t-[2rem] bg-background px-6 pb-10 pt-8"
        >
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Demo access enabled</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Type any account number and password to enter the demo banking app.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-account">Account Number</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-account"
                value={accountNumber}
                onChange={(event) => {
                  setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 12));
                  setError("");
                }}
                placeholder="Enter account number"
                inputMode="numeric"
                autoComplete="username"
                className="h-12 bg-muted/40 pl-10 text-base"
                data-ocid="login.account_number_input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                autoComplete="current-password"
                className="h-12 bg-muted/40 pl-10 pr-12 text-base"
                data-ocid="login.password_input"
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleLogin();
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-smooth hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-destructive" data-ocid="login.error_state">{error}</p>}

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm font-semibold text-primary" data-ocid="login.forgot_password_link">
              Forgot password?
            </Link>
            <span className="text-xs text-muted-foreground">Protected session</span>
          </div>

          <Button
            className="h-12 w-full rounded-xl font-display text-base font-semibold"
            onClick={handleLogin}
            disabled={loading}
            data-ocid="login.submit_button"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in
              </span>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">New customer</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-2 border-primary/50 font-display text-base font-semibold text-primary"
            onClick={() => navigate({ to: "/register" })}
            data-ocid="login.register_button"
          >
            Register Account
          </Button>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            By signing in, you agree to BCB digital banking terms and privacy practices.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
