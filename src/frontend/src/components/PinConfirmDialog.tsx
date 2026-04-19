import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface PinConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function PinConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  busy = false,
  onOpenChange,
  onConfirm,
}: PinConfirmDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setPin("");
      setError("");
    }
  }, [open]);

  const handleChange = (value: string) => {
    setError("");
    setPin(value.replace(/\D/g, "").slice(0, 4));
  };

  const handleConfirm = () => {
    if (pin.length !== 4) {
      setError("Enter your 4-digit PIN to continue.");
      return;
    }

    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !busy && onOpenChange(nextOpen)}>
      <DialogContent className="max-w-sm" data-ocid="pin_confirmation.dialog">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display">{title}</DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="secure-pin" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Transaction PIN
          </Label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="secure-pin"
              autoFocus
              inputMode="numeric"
              type="password"
              maxLength={4}
              value={pin}
              onChange={(event) => handleChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleConfirm();
              }}
              placeholder="****"
              className={cn("h-12 pl-10 text-center text-lg font-bold tracking-[0.6em]", error && "border-destructive")}
              data-ocid="pin_confirmation.input"
            />
          </div>
          {error && (
            <p className="text-xs font-medium text-destructive" data-ocid="pin_confirmation.error">
              {error}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            For this demo, any 4 digits will authorize the action.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            data-ocid="pin_confirmation.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            data-ocid="pin_confirmation.confirm_button"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
