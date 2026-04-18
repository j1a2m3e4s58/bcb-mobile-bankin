/**
 * Format a number as Ghanaian Cedis currency string
 * e.g. formatGHS(1234.56) → "GHS 1,234.56"
 */
export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a date string to human-readable format
 * e.g. "2026-04-15" → "Apr 15, 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date string to short format
 * e.g. "2026-04-15" → "15 Apr"
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Format an account number with masking
 * e.g. "1234567890" → "1234 *** 890"
 */
export function formatAccountNumber(account: string): string {
  if (account.length < 6) return account;
  const first = account.slice(0, 4);
  const last = account.slice(-3);
  return `${first} *** ${last}`;
}

/**
 * Format a phone number in Ghana format
 * e.g. "0241234567" → "024 123 4567"
 */
export function formatPhone(phone: string): string {
  if (phone.length === 10) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  }
  return phone;
}

/**
 * Get relative time (e.g. "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}
