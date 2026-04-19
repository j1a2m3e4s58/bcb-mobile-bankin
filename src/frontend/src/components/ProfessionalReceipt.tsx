import { Button } from "@/components/ui/button";
import { BANK_DETAILS } from "@/lib/support-data";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { CheckCircle2, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

export interface ReceiptRow {
  label: string;
  value: string;
  tone?: "success" | "danger" | "default";
}

interface ProfessionalReceiptProps {
  title: string;
  subtitle: string;
  amount: string;
  reference: string;
  dateTime: string;
  rows: ReceiptRow[];
  status?: string;
  onDone?: () => void;
  doneLabel?: string;
}

function maskAccount(account?: string) {
  if (!account) return "****";
  return `${account.slice(0, 3)}****${account.slice(-3)}`;
}

function buildReceiptText(customerName: string, maskedAccount: string, props: ProfessionalReceiptProps) {
  return [
    `${BANK_DETAILS.shortName} ${props.title}`,
    BANK_DETAILS.legalName,
    BANK_DETAILS.headOffice,
    "",
    `Customer: ${customerName}`,
    `Account: ${maskedAccount}`,
    `Reference: ${props.reference}`,
    `Date: ${props.dateTime}`,
    `Amount: ${props.amount}`,
    `Status: ${props.status ?? "Completed"}`,
    "",
    ...props.rows.map((row) => `${row.label}: ${row.value}`),
  ].join("\n");
}

export function ProfessionalReceipt(props: ProfessionalReceiptProps) {
  const user = useAuthStore((state) => state.user);
  const customerName = user?.name ?? "BCB Customer";
  const maskedAccount = maskAccount(user?.accountNumber);
  const receiptText = buildReceiptText(customerName, maskedAccount, props);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${BANK_DETAILS.shortName} Receipt ${props.reference}`,
          text: receiptText,
        });
      } else {
        await navigator.clipboard.writeText(receiptText);
        toast.success("Receipt copied", {
          description: "You can paste it into WhatsApp, email, or notes.",
        });
      }
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BCB-receipt-${props.reference}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-primary/12 bg-card text-left shadow-card">
      <div className="bcb-card-gradient px-5 py-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <img src="/assets/bcb-logo.png" alt="BCB Logo" className="h-12 w-12 rounded-full bg-white object-contain p-1" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-85">{BANK_DETAILS.shortName}</p>
            <h2 className="font-display text-lg font-bold leading-tight">{props.title}</h2>
            <p className="text-[11px] opacity-85">{BANK_DETAILS.legalName}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/12">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {props.subtitle}
        </p>
        <p className="mt-1 font-display text-3xl font-bold text-foreground">{props.amount}</p>
        <p className="mt-1 text-xs text-muted-foreground">{props.status ?? "Completed"} | {props.dateTime}</p>
      </div>

      <div className="mx-5 rounded-2xl border border-border bg-muted/25 p-4">
        <div className="grid grid-cols-2 gap-3 border-b border-border pb-3 text-xs">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="font-semibold text-foreground">{customerName}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Account</p>
            <p className="font-mono font-semibold text-foreground">{maskedAccount}</p>
          </div>
        </div>

        <div className="space-y-2 pt-3">
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-muted-foreground">Reference</span>
            <span className="break-all text-right font-mono font-semibold text-foreground">{props.reference}</span>
          </div>
          {props.rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 text-xs">
              <span className="shrink-0 text-muted-foreground">{row.label}</span>
              <span
                className={cn(
                  "break-words text-right font-semibold text-foreground",
                  row.tone === "success" && "text-success",
                  row.tone === "danger" && "text-destructive",
                )}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-2xl bg-primary/5 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
          {BANK_DETAILS.headOffice}. Digital Address: {BANK_DETAILS.digitalAddress}. For help, call{" "}
          <a href={`tel:${BANK_DETAILS.phoneInternational}`} className="font-semibold text-primary">
            {BANK_DETAILS.phone}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${BANK_DETAILS.email}`} className="font-semibold text-primary">
            {BANK_DETAILS.email}
          </a>
          .
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-11 gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button className="h-11 gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {props.onDone && (
          <Button className="mt-3 h-11 w-full" onClick={props.onDone}>
            {props.doneLabel ?? "Done"}
          </Button>
        )}
      </div>
    </div>
  );
}
