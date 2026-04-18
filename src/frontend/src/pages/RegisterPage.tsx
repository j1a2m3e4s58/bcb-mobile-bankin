import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface FieldDef {
  id: keyof FormState;
  label: string;
  placeholder: string;
  type: string;
  icon: React.ReactNode;
  hint?: string;
}

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  ghanaCard: string;
  pin: string;
  confirmPin: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    ghanaCard: "",
    pin: "",
    confirmPin: "",
  });

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (field === "pin" || field === "confirmPin") {
        val = val.replace(/\D/g, "").slice(0, 4);
      }
      setForm((f) => ({ ...f, [field]: val }));
    };
  }

  async function handleRegister() {
    if (!form.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (form.pin.length < 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (form.pin !== form.confirmPin) {
      toast.error("PINs do not match");
      return;
    }

    setLoading(true);
    await new Promise<void>((res) => setTimeout(res, 1500));
    setLoading(false);
    toast.success("Account created! Verify your number.");
    navigate({ to: "/otp" });
  }

  const textFields: FieldDef[] = [
    {
      id: "fullName",
      label: "Full Name",
      placeholder: "e.g. Kofi Mensah",
      type: "text",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "phone",
      label: "Phone Number",
      placeholder: "+233 XX XXX XXXX",
      type: "tel",
      icon: <Phone className="w-4 h-4" />,
    },
    {
      id: "email",
      label: "Email Address",
      placeholder: "you@example.com",
      type: "email",
      icon: <Mail className="w-4 h-4" />,
    },
    {
      id: "ghanaCard",
      label: "Ghana Card Number",
      placeholder: "GHA-XXXXXXXXX-X",
      type: "text",
      icon: <CreditCard className="w-4 h-4" />,
      hint: "Format: GHA-XXXXXXXXX-X",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-dvh desktop-bg">
      <div
        className="mobile-frame bg-background flex flex-col shadow-elevated"
        data-ocid="register.page"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 pt-12 pb-8 relative overflow-hidden"
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
            data-ocid="register.back_button"
            className="flex items-center gap-2 mr-1 relative z-10 transition-smooth"
            style={{ color: "oklch(0.99 0.002 0 / 0.8)" }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 relative z-10">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: "oklch(0.99 0.002 0 / 0.14)",
                border: "1px solid oklch(0.99 0.002 0 / 0.22)",
              }}
            >
              <img
                src="/assets/bcb-logo.png"
                alt="BCB"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1
                className="text-lg font-bold font-display leading-tight"
                style={{ color: "oklch(0.99 0.002 0)" }}
              >
                Create Account
              </h1>
              <p
                className="text-xs font-body"
                style={{ color: "oklch(0.88 0.005 140)" }}
              >
                Open your BCB account today
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          className="flex-1 overflow-y-auto bg-background rounded-t-3xl -mt-4 px-6 pt-7 pb-10 flex flex-col gap-4"
        >
          {textFields.map((field, idx) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.35 }}
              className="space-y-1.5"
            >
              <Label
                htmlFor={field.id}
                className="text-sm font-medium text-foreground"
              >
                {field.label}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {field.icon}
                </span>
                <Input
                  id={field.id}
                  data-ocid={`register.${field.id}_input`}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="pl-10 h-12 text-base bg-muted/40 border-input focus:border-primary"
                  value={form[field.id]}
                  onChange={update(field.id)}
                />
              </div>
              {field.hint && (
                <p className="text-xs text-muted-foreground pl-1">
                  {field.hint}
                </p>
              )}
            </motion.div>
          ))}

          {/* PIN */}
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.35 }}
            className="space-y-1.5"
          >
            <Label
              htmlFor="reg-pin"
              className="text-sm font-medium text-foreground"
            >
              Create 4-Digit PIN
            </Label>
            <div className="relative">
              <Input
                id="reg-pin"
                data-ocid="register.pin_input"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                placeholder="Create a 4-digit PIN"
                className="h-12 text-base tracking-widest bg-muted/40 border-input focus:border-primary pr-12"
                value={form.pin}
                onChange={update("pin")}
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
          </motion.div>

          {/* Confirm PIN */}
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.35 }}
            className="space-y-1.5"
          >
            <Label
              htmlFor="reg-confirm-pin"
              className="text-sm font-medium text-foreground"
            >
              Confirm PIN
            </Label>
            <div className="relative">
              <Input
                id="reg-confirm-pin"
                data-ocid="register.confirm_pin_input"
                type={showConfirmPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                placeholder="Re-enter your PIN"
                className={`h-12 text-base tracking-widest bg-muted/40 border-input focus:border-primary pr-12 ${
                  form.confirmPin && form.pin !== form.confirmPin
                    ? "border-destructive"
                    : ""
                }`}
                value={form.confirmPin}
                onChange={update("confirmPin")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                aria-label={showConfirmPin ? "Hide PIN" : "Show PIN"}
              >
                {showConfirmPin ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {form.confirmPin && form.pin !== form.confirmPin && (
              <p
                className="text-xs pl-1"
                style={{ color: "oklch(var(--destructive))" }}
                data-ocid="register.pin_mismatch_error"
              >
                PINs do not match
              </p>
            )}
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.35 }}
            className="mt-2"
          >
            <Button
              data-ocid="register.submit_button"
              className="w-full h-12 text-base font-semibold font-display rounded-xl transition-smooth"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                "Register"
              )}
            </Button>
          </motion.div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary"
              data-ocid="register.login_link"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
