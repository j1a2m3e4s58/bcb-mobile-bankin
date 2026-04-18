import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, RefreshCw, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { toast } from "sonner";

const OTP_POSITIONS = [0, 1, 2, 3, 4, 5] as const;
const OTP_LENGTH = OTP_POSITIONS.length;

export default function OtpPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    const char = val[val.length - 1];
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = "";
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      handleVerify();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = [...digits];
    for (let i = 0; i < text.length; i++) {
      next[i] = text[i];
    }
    setDigits(next);
    const lastIdx = Math.min(text.length, OTP_LENGTH - 1);
    inputRefs.current[lastIdx]?.focus();
  }

  async function handleVerify() {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    await new Promise<void>((res) => setTimeout(res, 1200));
    setLoading(false);
    toast.success("Verified! Welcome to BCB");
    navigate({ to: "/dashboard" });
  }

  function handleResend() {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setDigits(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    toast.info("A new code has been sent to your phone.");
  }

  const isComplete = digits.every((d) => d !== "");

  return (
    <div className="flex items-center justify-center min-h-dvh desktop-bg">
      <div
        className="mobile-frame bg-background flex flex-col shadow-elevated"
        data-ocid="otp.page"
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
            className="absolute bottom-[-40px] right-[-40px] w-48 h-48 rounded-full"
            style={{ background: "oklch(0.99 0.002 0 / 0.06)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9 }}
          />
          <button
            type="button"
            onClick={() => navigate({ to: "/register" })}
            data-ocid="otp.back_button"
            className="self-start mb-6 flex items-center gap-2 relative z-10 transition-smooth"
            style={{ color: "oklch(0.99 0.002 0 / 0.8)" }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative z-10"
            style={{
              background: "oklch(0.76 0.16 70 / 0.22)",
              border: "1px solid oklch(0.76 0.16 70 / 0.4)",
            }}
          >
            <Shield
              className="w-7 h-7"
              style={{ color: "oklch(0.76 0.16 70)" }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-2xl font-bold font-display relative z-10"
            style={{ color: "oklch(0.99 0.002 0)" }}
          >
            Verify Your Number
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm mt-2 font-body relative z-10"
            style={{ color: "oklch(0.88 0.005 140)" }}
          >
            We sent a 6-digit code to your phone number
          </motion.p>
        </div>

        {/* OTP Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
          className="flex-1 bg-background rounded-t-3xl -mt-4 px-6 pt-10 pb-10 flex flex-col"
        >
          {/* OTP digit boxes */}
          <div
            className="flex gap-3 justify-center mb-8"
            onPaste={handlePaste}
            data-ocid="otp.inputs"
          >
            {OTP_POSITIONS.map((pos) => (
              <motion.input
                key={`otp-pos-${pos}`}
                ref={(el) => {
                  inputRefs.current[pos] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digits[pos]}
                data-ocid={`otp.digit_input.${pos + 1}`}
                onChange={(e) => handleChange(pos, e)}
                onKeyDown={(e) => handleKeyDown(pos, e)}
                onFocus={(e) => e.target.select()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: pos * 0.06,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="w-12 h-14 text-center text-xl font-bold font-display rounded-xl border-2 bg-muted/40 outline-none transition-smooth"
                style={{
                  borderColor: digits[pos]
                    ? "oklch(var(--primary))"
                    : "oklch(var(--input))",
                  color: "oklch(var(--foreground))",
                  background: digits[pos]
                    ? "oklch(var(--primary) / 0.06)"
                    : undefined,
                }}
              />
            ))}
          </div>

          {/* Resend */}
          <p className="text-center text-sm text-muted-foreground mb-8">
            Didn't receive a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              data-ocid="otp.resend_button"
              disabled={resendTimer > 0}
              className="font-semibold inline-flex items-center gap-1 transition-smooth"
              style={{
                color:
                  resendTimer > 0
                    ? "oklch(var(--muted-foreground))"
                    : "oklch(var(--primary))",
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
            </button>
          </p>

          {/* Verify button */}
          <Button
            data-ocid="otp.verify_button"
            className="w-full h-12 text-base font-semibold font-display rounded-xl transition-smooth"
            style={{
              background: isComplete
                ? "oklch(var(--primary))"
                : "oklch(var(--muted))",
              color: isComplete
                ? "oklch(var(--primary-foreground))"
                : "oklch(var(--muted-foreground))",
            }}
            onClick={handleVerify}
            disabled={loading || !isComplete}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </Button>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-8">
            {OTP_POSITIONS.map((pos) => (
              <motion.div
                key={`dot-${pos}`}
                animate={{
                  scale: digits[pos] ? 1 : 0.65,
                  opacity: digits[pos] ? 1 : 0.3,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-2 h-2 rounded-full"
                style={{ background: "oklch(var(--primary))" }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
