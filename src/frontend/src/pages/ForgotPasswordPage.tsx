import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    setLoading(true);
    await new Promise<void>((res) => setTimeout(res, 1400));
    setLoading(false);
    setSent(true);
    toast.success("Reset code sent!");
  }

  return (
    <div className="flex items-center justify-center min-h-dvh desktop-bg">
      <div
        className="mobile-frame bg-background flex flex-col shadow-elevated"
        data-ocid="forgot.page"
      >
        {/* Header */}
        <div
          className="flex flex-col px-6 pt-12 pb-10 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.45 0.14 148) 0%, oklch(0.34 0.11 148) 100%)",
          }}
        >
          <motion.div
            className="absolute bottom-[-30px] right-[-30px] w-36 h-36 rounded-full"
            style={{ background: "oklch(0.99 0.002 0 / 0.07)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9 }}
          />
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            data-ocid="forgot.back_button"
            className="self-start mb-6 flex items-center gap-2 relative z-10 transition-smooth"
            style={{ color: "oklch(0.99 0.002 0 / 0.8)" }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* BCB Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative z-10 overflow-hidden"
            style={{
              background: "oklch(0.99 0.002 0 / 0.14)",
              border: "1px solid oklch(0.99 0.002 0 / 0.22)",
            }}
          >
            <img
              src="/assets/bcb-logo.png"
              alt="BCB"
              className="w-10 h-10 object-contain"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-2xl font-bold font-display relative z-10"
            style={{ color: "oklch(0.99 0.002 0)" }}
          >
            Forgot PIN?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm mt-2 font-body relative z-10 max-w-xs"
            style={{ color: "oklch(0.88 0.005 140)" }}
          >
            Enter your registered phone number and we'll send you a reset code
          </motion.p>
        </div>

        {/* Form / success */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
          className="flex-1 bg-background rounded-t-3xl -mt-4 px-6 pt-10 pb-10 flex flex-col"
        >
          {!sent ? (
            <>
              <div className="space-y-1.5 mb-6">
                <Label
                  htmlFor="reset-phone"
                  className="text-sm font-medium text-foreground"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-phone"
                    data-ocid="forgot.phone_input"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    className="pl-10 h-12 text-base bg-muted/40 border-input focus:border-primary"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                  />
                </div>
              </div>

              <Button
                data-ocid="forgot.send_button"
                className="w-full h-12 text-base font-semibold font-display rounded-xl transition-smooth mb-4"
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Code...
                  </span>
                ) : (
                  "Send Reset Code"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remembered your PIN?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary"
                  data-ocid="forgot.login_link"
                >
                  Sign In
                </Link>
              </p>

              {/* Security notice */}
              <div
                className="mt-auto flex items-start gap-3 rounded-xl p-4"
                style={{ background: "oklch(var(--muted) / 0.6)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "oklch(var(--primary) / 0.12)" }}
                >
                  <ShieldCheck
                    className="w-4 h-4"
                    style={{ color: "oklch(var(--primary))" }}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    Security Notice
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    BCB will never ask for your full PIN. Only use official BCB
                    channels.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex flex-col items-center text-center gap-4 py-8"
              data-ocid="forgot.success_state"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 18,
                  delay: 0.1,
                }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "oklch(var(--primary) / 0.1)" }}
              >
                <CheckCircle2
                  className="w-10 h-10"
                  style={{ color: "oklch(var(--primary))" }}
                />
              </motion.div>

              <div>
                <h2 className="text-xl font-bold font-display text-foreground mb-2">
                  Code Sent!
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  A 6-digit reset code has been sent to{" "}
                  <span className="font-semibold text-foreground">{phone}</span>
                  . Please check your messages.
                </p>
              </div>

              <Button
                data-ocid="forgot.continue_button"
                className="mt-2 w-full h-12 text-base font-semibold font-display rounded-xl transition-smooth"
                onClick={() => navigate({ to: "/otp" })}
              >
                Enter OTP Code
              </Button>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setPhone("");
                }}
                data-ocid="forgot.try_again_button"
                className="text-sm font-medium transition-smooth"
                style={{ color: "oklch(var(--primary))" }}
              >
                Try a different number
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
