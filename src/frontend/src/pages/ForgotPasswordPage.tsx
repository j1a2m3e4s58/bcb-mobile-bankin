import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!accountNumber.trim()) {
      toast.error("Enter your account number.");
      return;
    }

    setLoading(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSent(true);
    toast.success("Reset instructions prepared");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center desktop-bg">
      <div className="mobile-frame flex flex-col bg-background shadow-elevated" data-ocid="forgot.page">
        <div className="relative overflow-hidden px-6 pb-10 pt-12 text-primary-foreground bcb-card-gradient">
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
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
            Enter your account number to start a secure password reset.
          </p>
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="-mt-5 flex flex-1 flex-col rounded-t-[2rem] bg-background px-6 pb-10 pt-10"
        >
          {!sent ? (
            <>
              <div className="mb-6 space-y-1.5">
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
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleSend();
                    }}
                  />
                </div>
              </div>

              <Button
                data-ocid="forgot.send_button"
                className="mb-4 h-12 w-full rounded-xl font-display text-base font-semibold"
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing reset
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link to="/login" className="font-semibold text-primary" data-ocid="forgot.login_link">
                  Sign in
                </Link>
              </p>

              <div className="mt-auto flex items-start gap-3 rounded-xl bg-muted/60 p-4">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/12">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="mb-0.5 text-xs font-semibold text-foreground">Security Notice</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    BCB will never ask for your full password. Only use official BCB channels.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex flex-col items-center gap-4 py-8 text-center"
              data-ocid="forgot.success_state"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Reset Started</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  For demo mode, return to login and enter any account number and password.
                </p>
              </div>
              <Button className="mt-2 h-12 w-full" onClick={() => navigate({ to: "/login" })}>
                Back to Login
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
