export type TransactionType = "credit" | "debit";
export type TransactionCategory =
  | "transfer"
  | "payment"
  | "airtime"
  | "momo"
  | "salary"
  | "loan"
  | "savings";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  title: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  reference: string;
  status: "completed" | "pending" | "failed";
  icon: string;
}

export interface BankCard {
  id: string;
  type: "debit" | "credit";
  network: "visa" | "mastercard";
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  balance: number;
  isActive: boolean;
  isFrozen: boolean;
  spendingLimit: number;
  spentToday: number;
}

export interface Loan {
  id: string;
  type: string;
  amount: number;
  outstanding: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  nextPaymentDate: string;
  status: "active" | "approved" | "pending" | "completed";
  totalInstallments: number;
  paidInstallments: number;
}

export interface Notification {
  id: string;
  type: "transaction" | "security" | "promotion" | "system";
  title: string;
  message: string;
  date: string;
  time: string;
  isRead: boolean;
  icon: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: "txn001",
    type: "credit",
    category: "salary",
    title: "Salary Credit",
    description: "Monthly salary - Accra Metro Assembly",
    amount: 3200.0,
    date: "2026-04-15",
    time: "08:00 AM",
    reference: "SAL-20260415-001",
    status: "completed",
    icon: "💼",
  },
  {
    id: "txn002",
    type: "debit",
    category: "payment",
    title: "ECG Bill Payment",
    description: "Electricity bill - Accra North",
    amount: 185.5,
    date: "2026-04-14",
    time: "10:23 AM",
    reference: "ECG-20260414-889",
    status: "completed",
    icon: "⚡",
  },
  {
    id: "txn003",
    type: "debit",
    category: "momo",
    title: "MTN MoMo Transfer",
    description: "Sent to Ama Asante - 0554321876",
    amount: 500.0,
    date: "2026-04-13",
    time: "02:45 PM",
    reference: "MOMO-20260413-452",
    status: "completed",
    icon: "📱",
  },
  {
    id: "txn004",
    type: "debit",
    category: "airtime",
    title: "MTN Airtime Top-up",
    description: "Airtime for 0241234567",
    amount: 50.0,
    date: "2026-04-12",
    time: "09:15 AM",
    reference: "AIR-20260412-321",
    status: "completed",
    icon: "📞",
  },
  {
    id: "txn005",
    type: "credit",
    category: "transfer",
    title: "Fund Transfer Received",
    description: "From Kwame Boateng - 0209876543",
    amount: 1200.0,
    date: "2026-04-11",
    time: "04:30 PM",
    reference: "TRF-20260411-777",
    status: "completed",
    icon: "↙️",
  },
  {
    id: "txn006",
    type: "debit",
    category: "payment",
    title: "DStv Subscription",
    description: "DStv Premium - Smart Card 123456789",
    amount: 120.0,
    date: "2026-04-10",
    time: "11:00 AM",
    reference: "DSTV-20260410-555",
    status: "completed",
    icon: "📺",
  },
  {
    id: "txn007",
    type: "debit",
    category: "payment",
    title: "Ghana Water Bill",
    description: "Water bill - Madina area",
    amount: 75.0,
    date: "2026-04-09",
    time: "01:20 PM",
    reference: "GW-20260409-234",
    status: "completed",
    icon: "💧",
  },
  {
    id: "txn008",
    type: "debit",
    category: "transfer",
    title: "BCB Intra-bank Transfer",
    description: "Sent to Akosua Frimpong - 1234509876",
    amount: 800.0,
    date: "2026-04-08",
    time: "03:10 PM",
    reference: "BCB-20260408-199",
    status: "completed",
    icon: "🏦",
  },
  {
    id: "txn009",
    type: "debit",
    category: "momo",
    title: "Vodafone Cash Transfer",
    description: "Sent to Emmanuel Tetteh - 0204567890",
    amount: 250.0,
    date: "2026-04-07",
    time: "05:55 PM",
    reference: "VCASH-20260407-811",
    status: "completed",
    icon: "📲",
  },
  {
    id: "txn010",
    type: "credit",
    category: "savings",
    title: "Savings Interest",
    description: "Monthly interest on savings account",
    amount: 42.5,
    date: "2026-04-06",
    time: "12:00 AM",
    reference: "INT-20260406-001",
    status: "completed",
    icon: "💰",
  },
  {
    id: "txn011",
    type: "debit",
    category: "airtime",
    title: "AirtelTigo Data Bundle",
    description: "5GB data bundle for 0277654321",
    amount: 35.0,
    date: "2026-04-05",
    time: "07:30 AM",
    reference: "DATA-20260405-678",
    status: "completed",
    icon: "🌐",
  },
  {
    id: "txn012",
    type: "debit",
    category: "loan",
    title: "Loan Repayment",
    description: "Personal loan installment - April 2026",
    amount: 450.0,
    date: "2026-04-05",
    time: "09:00 AM",
    reference: "LOAN-20260405-002",
    status: "completed",
    icon: "🏛️",
  },
];

export const mockCards: BankCard[] = [
  {
    id: "card001",
    type: "debit",
    network: "visa",
    cardNumber: "4532 **** **** 7891",
    cardHolder: "KOFI MENSAH",
    expiry: "08/28",
    cvv: "***",
    balance: 12800.5,
    isActive: true,
    isFrozen: false,
    spendingLimit: 5000,
    spentToday: 685.5,
  },
  {
    id: "card002",
    type: "debit",
    network: "mastercard",
    cardNumber: "5412 **** **** 3301",
    cardHolder: "KOFI MENSAH",
    expiry: "03/27",
    cvv: "***",
    balance: 4250.0,
    isActive: true,
    isFrozen: false,
    spendingLimit: 2000,
    spentToday: 50.0,
  },
];

export const mockLoans: Loan[] = [
  {
    id: "loan001",
    type: "Personal Loan",
    amount: 10000.0,
    outstanding: 7650.0,
    monthlyPayment: 450.0,
    interestRate: 18.5,
    startDate: "2025-10-01",
    dueDate: "2027-09-30",
    nextPaymentDate: "2026-05-05",
    status: "active",
    totalInstallments: 24,
    paidInstallments: 7,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif001",
    type: "transaction",
    title: "Salary Received",
    message: "GHS 3,200.00 has been credited to your current account.",
    date: "2026-04-15",
    time: "08:00 AM",
    isRead: false,
    icon: "💼",
  },
  {
    id: "notif002",
    type: "transaction",
    title: "ECG Bill Paid",
    message: "GHS 185.50 debited for ECG electricity bill payment.",
    date: "2026-04-14",
    time: "10:23 AM",
    isRead: false,
    icon: "⚡",
  },
  {
    id: "notif003",
    type: "security",
    title: "New Login Detected",
    message: "A new login was detected on your account from Accra, Ghana.",
    date: "2026-04-13",
    time: "09:00 AM",
    isRead: true,
    icon: "🔐",
  },
  {
    id: "notif004",
    type: "promotion",
    title: "Special Loan Offer",
    message: "You qualify for a BCB Business Loan up to GHS 50,000 at 15% p.a.",
    date: "2026-04-12",
    time: "11:00 AM",
    isRead: true,
    icon: "🎁",
  },
  {
    id: "notif005",
    type: "transaction",
    title: "Transfer Received",
    message: "GHS 1,200.00 received from Kwame Boateng.",
    date: "2026-04-11",
    time: "04:30 PM",
    isRead: true,
    icon: "💸",
  },
  {
    id: "notif006",
    type: "system",
    title: "Account Statement Ready",
    message: "Your March 2026 account statement is now available for download.",
    date: "2026-04-10",
    time: "08:00 AM",
    isRead: true,
    icon: "📄",
  },
  {
    id: "notif007",
    type: "transaction",
    title: "DStv Subscription Renewed",
    message: "GHS 120.00 debited for DStv Premium subscription renewal.",
    date: "2026-04-10",
    time: "11:00 AM",
    isRead: true,
    icon: "📺",
  },
  {
    id: "notif008",
    type: "security",
    title: "PIN Change Successful",
    message:
      "Your transaction PIN was changed successfully. Contact us if you did not do this.",
    date: "2026-04-08",
    time: "02:00 PM",
    isRead: true,
    icon: "🔒",
  },
  {
    id: "notif009",
    type: "promotion",
    title: "Earn More with BCB Savings",
    message:
      "Upgrade to BCB Premium Savings and earn up to 12% annual interest.",
    date: "2026-04-07",
    time: "10:00 AM",
    isRead: true,
    icon: "🌟",
  },
  {
    id: "notif010",
    type: "transaction",
    title: "Loan Payment Due Soon",
    message: "Your loan repayment of GHS 450.00 is due on May 5, 2026.",
    date: "2026-04-06",
    time: "09:00 AM",
    isRead: true,
    icon: "⏰",
  },
];
