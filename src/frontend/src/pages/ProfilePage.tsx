import { AppBar } from "@/components/layout/AppBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatAccountNumber, formatDate, formatGHS } from "@/lib/formatters";
import { useAuthStore } from "@/store/auth-store";
import { useBankStore } from "@/store/bank-store";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Fingerprint,
  Globe,
  Laptop2,
  Lock,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  Sun,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/* ─── Types ─────────────────────────────────────────────── */
type Modal = "none" | "editProfile" | "changePin" | "logout";

interface KycDoc {
  label: string;
  status: "verified" | "pending";
  ocidKey: string;
}

const KYC_DOCS: KycDoc[] = [
  { label: "Ghana Card", status: "verified", ocidKey: "ghana_card" },
  { label: "Selfie (Liveness Check)", status: "verified", ocidKey: "selfie" },
  { label: "Proof of Address", status: "pending", ocidKey: "proof_of_address" },
];

/* ─── Section header ──────────────────────────────────────── */
function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-1 mt-5">
      {title}
    </p>
  );
}

/* ─── RowItem ─────────────────────────────────────────────── */
interface RowItemProps {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  trailing?: React.ReactNode;
  ocid: string;
  onClick?: () => void;
  danger?: boolean;
}

function RowItem({
  icon,
  label,
  desc,
  trailing,
  ocid,
  onClick,
  danger,
}: RowItemProps) {
  const isClickable = !!onClick;
  const Comp = isClickable ? "button" : "div";
  return (
    <Comp
      {...(isClickable ? { type: "button" as const, onClick } : {})}
      data-ocid={ocid}
      className={[
        "flex items-center gap-3 px-4 py-3.5 w-full text-left",
        isClickable
          ? "hover:bg-muted/40 active:bg-muted/60 transition-smooth"
          : "",
        danger ? "hover:bg-destructive/5" : "",
      ].join(" ")}
    >
      <div
        className={`flex-shrink-0 ${danger ? "text-destructive" : "text-primary"}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold ${danger ? "text-destructive" : "text-foreground"}`}
        >
          {label}
        </p>
        {desc && (
          <p className="text-xs text-muted-foreground truncate">{desc}</p>
        )}
      </div>
      {trailing ??
        (isClickable && !danger ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : null)}
    </Comp>
  );
}

/* ─── Edit Profile Modal ─────────────────────────────────── */
interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: { name: string; phone: string; email: string };
}

function EditProfileModal({ open, onClose, user }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState("14 Airport Rd, Accra, Ghana");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="w-[92vw] max-w-sm"
        data-ocid="profile.edit_profile_dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              data-ocid="profile.edit_name_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              data-ocid="profile.edit_email_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Phone (read-only)</Label>
            <Input
              id="edit-phone"
              value={user.phone}
              readOnly
              disabled
              className="opacity-60 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Home address"
              data-ocid="profile.edit_address_input"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-ocid="profile.edit_cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bcb-card-gradient text-primary-foreground"
            data-ocid="profile.edit_save_button"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Change PIN Modal ────────────────────────────────────── */
function ChangePinModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (newPin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("New PINs do not match.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
    onClose();
  };

  const handleClose = () => {
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="w-[92vw] max-w-sm"
        data-ocid="profile.change_pin_dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Change PIN</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="old-pin">Old PIN</Label>
            <Input
              id="old-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              data-ocid="profile.old_pin_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pin">New PIN</Label>
            <Input
              id="new-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              data-ocid="profile.new_pin_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pin">Confirm New PIN</Label>
            <Input
              id="confirm-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              data-ocid="profile.confirm_pin_input"
            />
          </div>
          {error && (
            <p
              className="text-xs text-destructive flex items-center gap-1"
              data-ocid="profile.pin_error_state"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </p>
          )}
        </div>
        <DialogFooter className="flex gap-2 mt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            data-ocid="profile.pin_cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !oldPin || !newPin || !confirmPin}
            className="flex-1 bcb-card-gradient text-primary-foreground"
            data-ocid="profile.pin_confirm_button"
          >
            {saving ? "Updating…" : "Update PIN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const darkMode = useAuthStore((s) => s.darkMode);
  const toggleDarkMode = useAuthStore((s) => s.toggleDarkMode);
  const logout = useAuthStore((s) => s.logout);
  const loans = useBankStore((s) => s.loans);

  const [modal, setModal] = useState<Modal>("none");
  const [biometric, setBiometric] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<"English" | "Twi">("English");

  const totalBalance =
    (user?.savingsBalance ?? 0) + (user?.currentBalance ?? 0);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const s = (i: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.05 * i, duration: 0.35 },
  });

  return (
    <div className="flex flex-col min-h-full bg-background pb-24">
      <AppBar title="Profile" showLogo showNotifications={false} />

      {/* ── Profile Header ── */}
      <motion.div
        {...s(0)}
        className="mx-4 mt-4 bg-card rounded-2xl shadow-card overflow-hidden"
        data-ocid="profile.header_card"
      >
        <div className="bcb-card-gradient h-1.5 w-full" />
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-[72px] h-[72px] rounded-full bcb-card-gradient flex items-center justify-center text-2xl font-bold text-primary-foreground font-display shadow-elevated border-2 border-card">
                {user?.avatarInitials ?? "KM"}
              </div>
              {user?.kycVerified && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-success text-success-foreground shadow-sm"
                  aria-label="KYC Verified"
                >
                  <CheckCircle2 className="w-3 h-3" />
                </span>
              )}
            </div>
            {/* User info */}
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-lg font-bold text-foreground font-display leading-tight">
                {user?.name ?? "Kofi Mensah"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user?.phone ?? "0241234567"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email ?? "kofi.mensah@gmail.com"}
              </p>
            </div>
          </div>

          {/* Account stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Account</p>
              <p className="text-xs font-semibold text-foreground font-mono">
                {formatAccountNumber(user?.accountNumber ?? "1234567890")}
              </p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-[10px] text-muted-foreground">Total Balance</p>
              <p className="text-xs font-semibold text-foreground font-display">
                {formatGHS(totalBalance)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Member Since</p>
              <p className="text-xs font-semibold text-foreground">
                {formatDate(user?.memberSince ?? "2022-03-15")}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full h-9 border-primary/30 text-primary hover:bg-primary/5 font-semibold"
            onClick={() => setModal("editProfile")}
            data-ocid="profile.edit_profile_button"
          >
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {/* ── Loan summary (if any) ── */}
      {loans.length > 0 && (
        <motion.div
          {...s(1)}
          className="mx-4 mt-3 bg-primary/5 border border-primary/15 rounded-2xl p-4"
        >
          <p className="text-xs text-muted-foreground">Active Loan</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm font-semibold text-foreground font-display">
              {loans[0].type}
            </p>
            <p className="text-sm font-bold text-primary font-display">
              {formatGHS(loans[0].outstanding)}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Next payment: {formatDate(loans[0].nextPaymentDate)}
          </p>
        </motion.div>
      )}

      {/* ── KYC Verification ── */}
      <motion.div {...s(2)}>
        <SectionHeader title="KYC Verification" />
        <div
          className="mx-4 bg-card rounded-2xl shadow-card overflow-hidden"
          data-ocid="profile.kyc_card"
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                KYC Status
              </span>
            </div>
            <Badge className="bg-success/12 text-success border border-success/25 text-xs font-semibold gap-1 px-2 py-0.5">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </Badge>
          </div>
          {KYC_DOCS.map((doc) => (
            <div
              key={doc.label}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2.5">
                {doc.status === "verified" ? (
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-accent-foreground flex-shrink-0" />
                )}
                <span className="text-sm text-foreground">{doc.label}</span>
              </div>
              {doc.status === "verified" ? (
                <Badge className="bg-success/10 text-success border-0 text-[10px]">
                  Verified
                </Badge>
              ) : (
                <button
                  type="button"
                  data-ocid={`profile.kyc_upload_${doc.ocidKey}_button`}
                  className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 transition-smooth px-2.5 py-1 rounded-lg"
                  onClick={() => {
                    const inp = document.createElement("input");
                    inp.type = "file";
                    inp.accept = "image/*,.pdf";
                    inp.click();
                  }}
                >
                  <Upload className="w-3 h-3" /> Upload
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Security ── */}
      <motion.div {...s(3)}>
        <SectionHeader title="Security" />
        <div
          className="mx-4 bg-card rounded-2xl shadow-card divide-y divide-border"
          data-ocid="profile.security_card"
        >
          <RowItem
            icon={<Lock className="w-5 h-5" />}
            label="Change PIN"
            desc="Update your 4-digit secure PIN"
            ocid="profile.change_pin_button"
            onClick={() => setModal("changePin")}
          />
          <RowItem
            icon={<Fingerprint className="w-5 h-5" />}
            label="Biometric Login"
            desc={
              biometric
                ? "Fingerprint / Face ID enabled"
                : "Use fingerprint or Face ID"
            }
            ocid="profile.biometric_item"
            trailing={
              <Switch
                checked={biometric}
                onCheckedChange={setBiometric}
                data-ocid="profile.biometric_toggle"
                aria-label="Toggle biometric login"
              />
            }
          />
          <RowItem
            icon={<Smartphone className="w-5 h-5" />}
            label="Two-Factor Authentication"
            desc={twoFA ? "2FA enabled via SMS" : "Add extra account security"}
            ocid="profile.twofa_item"
            trailing={
              <Switch
                checked={twoFA}
                onCheckedChange={setTwoFA}
                data-ocid="profile.twofa_toggle"
                aria-label="Toggle two-factor authentication"
              />
            }
          />
        </div>
      </motion.div>

      {/* ── Preferences ── */}
      <motion.div {...s(4)}>
        <SectionHeader title="Preferences" />
        <div
          className="mx-4 bg-card rounded-2xl shadow-card divide-y divide-border"
          data-ocid="profile.preferences_card"
        >
          <RowItem
            icon={
              darkMode ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )
            }
            label="Dark Mode"
            desc={darkMode ? "Dark theme active" : "Light theme active"}
            ocid="profile.dark_mode_item"
            trailing={
              <Switch
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                data-ocid="profile.dark_mode_toggle"
                aria-label="Toggle dark mode"
              />
            }
          />
          <RowItem
            icon={<Globe className="w-5 h-5" />}
            label="Language"
            desc={language}
            ocid="profile.language_item"
            trailing={
              <button
                type="button"
                data-ocid="profile.language_toggle"
                onClick={() =>
                  setLanguage((l) => (l === "English" ? "Twi" : "English"))
                }
                className="text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 transition-smooth px-3 py-1 rounded-lg"
              >
                {language === "English" ? "Switch to Twi" : "Switch to English"}
              </button>
            }
          />
          <RowItem
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
            desc={notifications ? "Transaction alerts on" : "Alerts disabled"}
            ocid="profile.notifications_item"
            trailing={
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
                data-ocid="profile.notifications_toggle"
                aria-label="Toggle notifications"
              />
            }
          />
        </div>
      </motion.div>

      {/* ── Active Sessions ── */}
      <motion.div {...s(5)}>
        <SectionHeader title="Active Sessions" />
        <div
          className="mx-4 bg-card rounded-2xl shadow-card overflow-hidden"
          data-ocid="profile.sessions_card"
        >
          <div className="flex items-start gap-3 px-4 py-3.5 border-b border-border">
            <Laptop2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                This device
              </p>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
            <Badge className="bg-success/10 text-success border-0 text-[10px] self-center">
              Active
            </Badge>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Auto-logout after{" "}
              <span className="font-semibold text-foreground">5 min</span>{" "}
              inactivity
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Last login:{" "}
              <span className="font-semibold text-foreground">
                Today 9:41 AM
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── BCB Brand + Logout ── */}
      <motion.div {...s(6)} className="mx-4 mt-6 space-y-4">
        <div className="flex items-center justify-center gap-2 py-1">
          <img
            src="/assets/bcb-logo.png"
            alt="BCB"
            className="w-7 h-7 object-contain opacity-70"
          />
          <p className="text-xs text-muted-foreground font-semibold">
            Bawjiase Community Bank
          </p>
        </div>
        <Separator />
        <Button
          variant="outline"
          className="w-full h-12 border-destructive/35 text-destructive hover:bg-destructive/5 hover:border-destructive/50 gap-2 font-semibold transition-smooth"
          onClick={() => setModal("logout")}
          data-ocid="profile.logout_button"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </motion.div>

      {/* ── Modals ── */}
      <EditProfileModal
        open={modal === "editProfile"}
        onClose={() => setModal("none")}
        user={{
          name: user?.name ?? "Kofi Mensah",
          phone: user?.phone ?? "0241234567",
          email: user?.email ?? "kofi.mensah@gmail.com",
        }}
      />

      <ChangePinModal
        open={modal === "changePin"}
        onClose={() => setModal("none")}
      />

      <Dialog
        open={modal === "logout"}
        onOpenChange={(v) => !v && setModal("none")}
      >
        <DialogContent
          className="w-[92vw] max-w-sm"
          data-ocid="profile.logout_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Sign Out</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to sign out of your BCB account? You&apos;ll
            need your PIN to log back in.
          </p>
          <DialogFooter className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setModal("none")}
              className="flex-1"
              data-ocid="profile.logout_cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex-1"
              data-ocid="profile.logout_confirm_button"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keepalive for AnimatePresence (used in sub-screens if added) */}
      <AnimatePresence />
    </div>
  );
}
