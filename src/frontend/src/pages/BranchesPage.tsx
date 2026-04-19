import { AppBar } from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { BANK_DETAILS, BRANCHES } from "@/lib/support-data";
import { Mail, Map, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";

export default function BranchesPage() {
  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <AppBar title="Branches" showBack showNotifications={false} />

      <div className="px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-primary/15 bg-primary/5 p-5"
        >
          <div className="flex items-start gap-3">
            <Map className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Find a BCB branch</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Verified branch contact details are listed below. A live map can be added later when the final map provider is selected.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 space-y-3">
          {BRANCHES.map((branch, index) => (
            <motion.div
              key={branch.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-3xl bg-card p-5 shadow-card"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-base font-semibold text-foreground">{branch.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{branch.address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{branch.hours}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="h-10 gap-2 text-xs">
                  <a href={`tel:${branch.phone}`}>
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-10 gap-2 text-xs">
                  <a href={`mailto:${branch.email}`}>
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-4 px-1 text-xs leading-relaxed text-muted-foreground">
          Head office: {BANK_DETAILS.postalAddress}. Please confirm large cash services with the branch before visiting.
        </p>
      </div>
    </div>
  );
}
