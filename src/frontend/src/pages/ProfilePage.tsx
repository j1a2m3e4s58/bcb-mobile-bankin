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
  ClipboardCheck,
  Clock,
  Fingerprint,
  Globe,
  Headphones,
  Laptop2,
  Lock,
  LogOut,
  MapPin,
  Moon,
  Shield,
  Smartphone,
  Sun,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

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

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="mb-1 mt-5 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </p>
  );
}

interface RowItemProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
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
  danger = false,
}: RowItemProps) {
  const clickable = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      disabled={!clickable}
      className={cnRow(
        "flex w-full items-center gap-3 px-4 py-3.5 text-left",
        clickable && "transition-smooth hover:bg-muted/40 active:bg-muted/60",
        danger && "hover:bg-destructive/5",
        !clickable && "cursor-default",
      )}
    >
      <div className={danger ? "text-destructive" : "text-primary"}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className={danger ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-foreground"}>
          {label}
        </p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      {trailing ?? (clickable && !danger ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : null)}
    </button>
  );
}

function cnRow(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function EditProfileModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: { name: string; phone: string; email: string };
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState("14 Airport Rd, Accra, Ghana");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="w-[92vw] max-w-sm" data-ocid="profile.edit_profile_dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              data-ocid="profile.edit_email_input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Phone (read-only)</Label>
            <Input id="edit-phone" value={user.phone} readOnly disabled className="cursor-not-allowed opacity-60" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Home address"
              data-ocid="profile.edit_address_input"
            />
          </div>
        </div>

        <DialogFooter className="mt-2 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1" data-ocid="profile.edit_cancel_button">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bcb-card-gradient text-primary-foreground"
            data-ocid="profile.edit_save_button"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangePinModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
    setError("");
    onClose();
  };

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
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="w-[92vw] max-w-sm" data-ocid="profile.change_pin_dialog">
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
              onChange={(event) => setOldPin(event.target.value.replace(/\D/g, ""))}
              placeholder="****"
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
              onChange={(event) => setNewPin(event.target.value.replace(/\D/g, ""))}
              placeholder="****"
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
              onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, ""))}
              placeholder="****"
              data-ocid="profile.confirm_pin_input"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1 text-xs text-destructive" data-ocid="profile.pin_error_state">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="mt-2 flex gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1" data-ocid="profile.pin_cancel_button">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !oldPin || !newPin || !confirmPin}
            className="flex-1 bcb-card-gradient text-primary-foreground"
            data-ocid="profile.pin_confirm_button"
          >
            {saving ? "Updating..." : "Update PIN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const darkMode = useAuthStore((state) => state.darkMode);
  const toggleDarkMode = useAuthStore((state) => state.toggleDarkMode);
  const logout = useAuthStore((state) => state.logout);
  const loans = useBankStore((state) => state.loans);
  const currentBalance = useBankStore((state) => state.currentBalance);
  const savingsBalance = useBankStore((state) => state.savingsBalance);

  const [modal, setModal] = useState<Modal>("none");
  const [biometric, setBiometric] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<"English" | "Twi">("English");

  const totalBalance = currentBalance + savingsBalance;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const sectionAnimation = (index: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.05 * index, duration: 0.35 },
  });

  const safeUser = {
    name: user?.name ?? "Kofi Mensah",
    phone: user?.phone ?? "0241234567",
    email: user?.email ?? "kofi.mensah@gmail.com",
    accountNumber: user?.accountNumber ?? "1234567890",
    avatarInitials: user?.avatarInitials ?? "KM",
    kycVerified: user?.kycVerified ?? true,
    memberSince: user?.memberSince ?? "2022-03-15",
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <AppBar title="Profile" showLogo showNotifications={false} />

      <motion.div
        {...sectionAnimation(0)}
        className="mx-4 mt-4 overflow-hidden rounded-2xl bg-card shadow-card"
        data-ocid="profile.header_card"
      >
        <div className="h-1.5 w-full bcb-card-gradient" />
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-card bcb-card-gradient font-display text-2xl font-bold text-primary-foreground shadow-elevated">
                {safeUser.avatarInitials}
              </div>
              {safeUser.kycVerified && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground shadow-sm"
                  aria-label="KYC Verified"
                >
                  <CheckCircle2 className="h-3 w-3" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <h2 className="font-display text-lg font-bold leading-tight text-foreground">
                {safeUser.name}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{safeUser.phone}</p>
              <p className="truncate text-xs text-muted-foreground">{safeUser.email}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Account</p>
              <p className="font-mono text-xs font-semibold text-foreground">
                {formatAccountNumber(safeUser.accountNumber)}
              </p>
            </div>
            <div className="border-x border-border text-center">
              <p className="text-[10px] text-muted-foreground">Total Balance</p>
              <p className="font-display text-xs font-semibold text-foreground">
                {formatGHS(totalBalance)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Member Since</p>
              <p className="text-xs font-semibold text-foreground">
                {formatDate(safeUser.memberSince)}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-9 w-full border-primary/30 font-semibold text-primary hover:bg-primary/5"
            onClick={() => setModal("editProfile")}
            data-ocid="profile.edit_profile_button"
          >
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {loans.length > 0 && (
        <motion.div
          {...sectionAnimation(1)}
          className="mx-4 mt-3 rounded-2xl border border-primary/15 bg-primary/5 p-4"
        >
          <p className="text-xs text-muted-foreground">Active Loan</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-foreground">{loans[0].type}</p>
            <p className="font-display text-sm font-bold text-primary">
              {formatGHS(loans[0].outstanding)}
            </p>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Next payment: {formatDate(loans[0].nextPaymentDate)}
          </p>
        </motion.div>
      )}

      <motion.div {...sectionAnimation(2)}>
        <SectionHeader title="KYC Verification" />
        <div className="mx-4 overflow-hidden rounded-2xl bg-card shadow-card" data-ocid="profile.kyc_card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">KYC Status</span>
            </div>
            <Badge className="gap-1 border border-success/25 bg-success/12 px-2 py-0.5 text-xs font-semibold text-success">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          </div>

          {KYC_DOCS.map((doc) => (
            <div
              key={doc.label}
              className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                {doc.status === "verified" ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                ) : (
                  <Clock className="h-4 w-4 flex-shrink-0 text-accent-foreground" />
                )}
                <span className="text-sm text-foreground">{doc.label}</span>
              </div>

              {doc.status === "verified" ? (
                <Badge className="border-0 bg-success/10 text-[10px] text-success">
                  Verified
                </Badge>
              ) : (
                <button
                  type="button"
                  data-ocid={`profile.kyc_upload_${doc.ocidKey}_button`}
                  className="flex items-center gap-1 rounded-lg bg-primary/8 px-2.5 py-1 text-xs font-semibold text-primary transition-smooth hover:bg-primary/15"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*,.pdf";
                    input.click();
                  }}
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div {...sectionAnimation(3)}>
        <SectionHeader title="Security" />
        <div className="mx-4 divide-y divide-border rounded-2xl bg-card shadow-card" data-ocid="profile.security_card">
          <RowItem
            icon={<Lock className="h-5 w-5" />}
            label="Change PIN"
            desc="Update your 4-digit secure PIN"
            ocid="profile.change_pin_button"
            onClick={() => setModal("changePin")}
          />
          <RowItem
            icon={<Fingerprint className="h-5 w-5" />}
            label="Biometric Login"
            desc={biometric ? "Fingerprint or Face ID enabled" : "Use fingerprint or Face ID"}
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
            icon={<Smartphone className="h-5 w-5" />}
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

      <motion.div {...sectionAnimation(4)}>
        <SectionHeader title="Preferences" />
        <div
          className="mx-4 divide-y divide-border rounded-2xl bg-card shadow-card"
          data-ocid="profile.preferences_card"
        >
          <RowItem
            icon={darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
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
            icon={<Globe className="h-5 w-5" />}
            label="Language"
            desc={language}
            ocid="profile.language_item"
            trailing={
              <button
                type="button"
                data-ocid="profile.language_toggle"
                onClick={() => setLanguage((value) => (value === "English" ? "Twi" : "English"))}
                className="rounded-lg bg-primary/8 px-3 py-1 text-xs font-semibold text-primary transition-smooth hover:bg-primary/15"
              >
                {language === "English" ? "Switch to Twi" : "Switch to English"}
              </button>
            }
          />
          <RowItem
            icon={<Bell className="h-5 w-5" />}
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

      <motion.div {...sectionAnimation(5)}>
        <SectionHeader title="Help" />
        <div className="mx-4 divide-y divide-border rounded-2xl bg-card shadow-card" data-ocid="profile.help_card">
          <RowItem
            icon={<Headphones className="h-5 w-5" />}
            label="Support Center"
            desc="Call, email, or get security help"
            ocid="profile.support_button"
            onClick={() => navigate({ to: "/support" })}
          />
          <RowItem
            icon={<MapPin className="h-5 w-5" />}
            label="Branches"
            desc="Find verified branch contacts"
            ocid="profile.branches_button"
            onClick={() => navigate({ to: "/branches" })}
          />
          <RowItem
            icon={<ClipboardCheck className="h-5 w-5" />}
            label="Back Office"
            desc="Review applications and support queues"
            ocid="profile.admin_button"
            onClick={() => navigate({ to: "/admin" })}
          />
        </div>
      </motion.div>

      <motion.div {...sectionAnimation(6)}>
        <SectionHeader title="Active Sessions" />
        <div className="mx-4 overflow-hidden rounded-2xl bg-card shadow-card" data-ocid="profile.sessions_card">
          <div className="flex items-start gap-3 border-b border-border px-4 py-3.5">
            <Laptop2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">This device</p>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
            <Badge className="self-center border-0 bg-success/10 text-[10px] text-success">
              Active
            </Badge>
          </div>
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Auto-logout after <span className="font-semibold text-foreground">5 min</span> inactivity
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
            <p className="text-sm text-muted-foreground">
              Last login: <span className="font-semibold text-foreground">Today 9:41 AM</span>
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div {...sectionAnimation(7)} className="mx-4 mt-6 space-y-4">
        <div className="flex items-center justify-center gap-2 py-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            BCB
          </p>
          <p className="text-xs text-muted-foreground">Bawjiase Community Bank</p>
        </div>
        <Separator />
        <Button
          variant="outline"
          className="h-12 w-full gap-2 border-destructive/35 font-semibold text-destructive transition-smooth hover:border-destructive/50 hover:bg-destructive/5"
          onClick={() => setModal("logout")}
          data-ocid="profile.logout_button"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </motion.div>

      <EditProfileModal
        open={modal === "editProfile"}
        onClose={() => setModal("none")}
        user={{
          name: safeUser.name,
          phone: safeUser.phone,
          email: safeUser.email,
        }}
      />

      <ChangePinModal open={modal === "changePin"} onClose={() => setModal("none")} />

      <Dialog open={modal === "logout"} onOpenChange={(value) => !value && setModal("none")}>
        <DialogContent className="w-[92vw] max-w-sm" data-ocid="profile.logout_dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Sign Out</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to sign out of your BCB account? You will need your PIN to log back in.
          </p>
          <DialogFooter className="mt-2 flex gap-2">
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
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence />
    </div>
  );
}
