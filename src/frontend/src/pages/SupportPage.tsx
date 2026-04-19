import { AppBar } from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { BANK_DETAILS } from "@/lib/support-data";
import { ExternalLink, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

const contactActions = [
  {
    label: "Call Customer Support",
    detail: BANK_DETAILS.phone,
    href: `tel:${BANK_DETAILS.phoneInternational}`,
    icon: Phone,
  },
  {
    label: "Email Support",
    detail: BANK_DETAILS.email,
    href: `mailto:${BANK_DETAILS.email}`,
    icon: Mail,
  },
  {
    label: "Open Website",
    detail: BANK_DETAILS.website.replace("https://", ""),
    href: BANK_DETAILS.website,
    icon: ExternalLink,
  },
];

export default function SupportPage() {
  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <AppBar title="Support" showBack showNotifications={false} />

      <div className="px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl bg-card shadow-card"
        >
          <div className="bcb-card-gradient px-5 py-5 text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-80">BCB Help Desk</p>
            <h1 className="mt-2 font-display text-2xl font-bold">How can we help?</h1>
            <p className="mt-2 text-sm opacity-85">
              Use verified Bawjiase Area Rural Bank contact channels for account and transaction support.
            </p>
          </div>

          <div className="divide-y divide-border">
            {contactActions.map(({ label, detail, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="flex items-center gap-3 px-5 py-4 transition-smooth hover:bg-muted/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{detail}</span>
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Security emergency</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                If your card, PIN, or account is compromised, call support immediately or visit the nearest BCB branch.
              </p>
            </div>
          </div>
          <Button asChild className="mt-4 h-11 w-full">
            <a href={`tel:${BANK_DETAILS.phoneInternational}`}>Call Now</a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-4 rounded-3xl border border-primary/15 bg-primary/5 p-5"
        >
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Head office</h2>
              <p className="mt-1 text-sm text-muted-foreground">{BANK_DETAILS.headOffice}</p>
              <p className="mt-1 text-xs text-muted-foreground">Digital Address: {BANK_DETAILS.digitalAddress}</p>
              <p className="mt-1 text-xs text-muted-foreground">Hours: {BANK_DETAILS.hours}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
