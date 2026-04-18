import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pinRef = useRef<HTMLInputElement>(null);

  const filledDots = pin.length;

  async function handleLogin() {
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (pin.length < 4) {
      setError("Please enter your 4-digit PIN");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const ok = await login(phone, pin);
      if (ok) {
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handlePinKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div className="flex items-center justify-center min-h-dvh desktop-bg">
      <div
        className="mobile-frame bg-background flex flex-col shadow-elevated overflow-y-auto"
        data-ocid="login.page"
      >
        {/* Green header */}
        <div
          className="flex flex-col items-center pt-14 pb-10 px-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.45 0.14 148) 0%, oklch(0.34 0.11 148) 100%)",
          }}
        >
          <motion.div
            className="absolute top-[-40px] right-[-40px] w-44 h-44 rounded-full"
            style={{ background: "oklch(0.99 0.002 0 / 0.07)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9 }}
          />

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-card overflow-hidden mb-4 relative z-10"
            style={{
              background: "oklch(0.99 0.002 0 / 0.14)",
              border: "1px solid oklch(0.99 0.002 0 / 0.22)",
            }}
          >
            <img
              src="/assets/bcb-logo.png"
              alt="BCB"
              className="w-14 h-14 object-contain"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl font-bold font-display relative z-10"
            style={{ color: "oklch(0.99 0.002 0)" }}
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-sm mt-1 font-body relative z-10"
            style={{ color: "oklch(0.88 0.005 140)" }}
          >
            Sign in to your BCB account
          </motion.p>
        </div>

        {/* Form card with rounded top */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="flex-1 bg-background rounded-t-3xl -mt-4 px-6 pt-8 pb-10 flex flex-col gap-5"
        >
          {/* Phone */}
          <div className="space-y-1.5">
            <Label
              htmlFor="login-phone"
              className="text-sm font-medium text-foreground"
            >
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="login-phone"
                data-ocid="login.phone_input"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                className="pl-10 h-12 text-base bg-muted/40 border-input focus:border-primary"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* PIN */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              4-Digit PIN
            </Label>

            {/* Visual dot indicators */}
            <div className="flex gap-3 mb-2" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: i < filledDots ? 1.2 : 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 14 }}
                  className="w-3 h-3 rounded-full border-2 transition-smooth"
                  style={{
                    borderColor: "oklch(var(--primary))",
                    background:
                      i < filledDots ? "oklch(var(--primary))" : "transparent",
                  }}
                />
              ))}
            </div>

            <div className="relative">
              <Input
                ref={pinRef}
                id="login-pin"
                data-ocid="login.pin_input"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                className="h-12 text-base tracking-widest bg-muted/40 border-input focus:border-primary pr-12"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(val);
                  setError("");
                }}
                onKeyDown={handlePinKeyDown}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-sm -mt-2"
              style={{ color: "oklch(var(--destructive))" }}
              data-ocid="login.error_state"
            >
              {error}
            </p>
          )}

          {/* Forgot PIN */}
          <div className="text-right -mt-3">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold transition-smooth"
              style={{ color: "oklch(var(--primary))" }}
              data-ocid="login.forgot_password_link"
            >
              Forgot PIN?
            </Link>
          </div>

          {/* Login Button */}
          <Button
            data-ocid="login.submit_button"
            className="h-12 text-base font-semibold font-display rounded-xl transition-smooth w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </Button>

          {/* Biometric hint */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">👆</span>
            <span className="text-sm text-muted-foreground">
              Use biometric login
            </span>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 -my-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Register */}
          <Button
            variant="outline"
            data-ocid="login.register_button"
            className="h-12 text-base font-semibold font-display rounded-xl border-2 transition-smooth w-full"
            style={{
              borderColor: "oklch(var(--primary))",
              color: "oklch(var(--primary))",
            }}
            onClick={() => navigate({ to: "/register" })}
          >
            Create New Account
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-1">
            By continuing, you agree to BCB's{" "}
            <span className="underline cursor-pointer">Terms</span> &{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
