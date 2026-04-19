import { AppBar } from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { downloadSimplePdf, downloadTextFile } from "@/lib/download";
import { formatDate, formatGHS } from "@/lib/formatters";
import { useAuthStore } from "@/store/auth-store";
import { useBankStore } from "@/store/bank-store";
import { Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";

type StatementPeriod = "30" | "90" | "180" | "365";

export default function StatementsPage() {
  const user = useAuthStore((state) => state.user);
  const transactions = useBankStore((state) => state.transactions);
  const currentBalance = useBankStore((state) => state.currentBalance);
  const savingsBalance = useBankStore((state) => state.savingsBalance);
  const [period, setPeriod] = useState<StatementPeriod>("90");

  const statementTransactions = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(period));
    return transactions.filter((transaction) => new Date(transaction.date) >= cutoff);
  }, [period, transactions]);

  const totalCredit = statementTransactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalDebit = statementTransactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const statementLines = [
    `Customer: ${user?.name ?? "BCB Customer"}`,
    `Account: ${user?.accountNumber ?? "1234567890"}`,
    `Period: Last ${period} days`,
    `Opening Balance: ${formatGHS(currentBalance + totalDebit - totalCredit)}`,
    `Closing Balance: ${formatGHS(currentBalance)}`,
    `Savings Balance: ${formatGHS(savingsBalance)}`,
    "",
    ...statementTransactions.map(
      (transaction) =>
        `${formatDate(transaction.date)} ${transaction.time} | ${transaction.reference} | ${transaction.title} | ${transaction.type === "credit" ? "+" : "-"}${formatGHS(transaction.amount)}`,
    ),
  ];

  const downloadCsv = () => {
    const rows = [
      "Date,Time,Reference,Description,Type,Amount,Status",
      ...statementTransactions.map((transaction) =>
        [
          formatDate(transaction.date),
          transaction.time,
          transaction.reference,
          transaction.title,
          transaction.type,
          transaction.amount.toFixed(2),
          transaction.status,
        ].join(","),
      ),
    ];
    downloadTextFile("BCB-account-statement.csv", rows.join("\n"), "text/csv;charset=utf-8");
  };

  const downloadPdf = () => {
    downloadSimplePdf("BCB-account-statement.pdf", "BCB Account Statement", statementLines);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-24">
      <AppBar title="Account Statement" showBack showNotifications={false} />

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-3xl p-5 text-primary-foreground bcb-card-gradient">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-80">Statement</p>
          <h1 className="mt-2 font-display text-2xl font-bold">{user?.name ?? "BCB Customer"}</h1>
          <p className="mt-1 text-sm opacity-85">Account {user?.accountNumber ?? "1234567890"}</p>
        </div>

        <div className="rounded-3xl bg-card p-4 shadow-card">
          <label htmlFor="statement-period" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Statement Period
          </label>
          <select
            id="statement-period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as StatementPeriod)}
            className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 180 days</option>
            <option value="365">Last 12 months</option>
          </select>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Total Credits</p>
              <p className="mt-1 font-display text-lg font-bold text-success">{formatGHS(totalCredit)}</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Total Debits</p>
              <p className="mt-1 font-display text-lg font-bold text-destructive">{formatGHS(totalDebit)}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 gap-2" onClick={downloadCsv}>
              <FileText className="h-4 w-4" />
              CSV
            </Button>
            <Button className="h-11 gap-2" onClick={downloadPdf}>
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-card p-4 shadow-card">
          <h2 className="font-display text-base font-semibold text-foreground">Statement Transactions</h2>
          <div className="mt-3 space-y-2">
            {statementTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-2xl border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{transaction.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.date)} | {transaction.reference}</p>
                  </div>
                  <p className={transaction.type === "credit" ? "text-sm font-bold text-success" : "text-sm font-bold text-destructive"}>
                    {transaction.type === "credit" ? "+" : "-"}{formatGHS(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
