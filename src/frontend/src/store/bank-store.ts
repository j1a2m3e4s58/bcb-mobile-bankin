import {
  INITIAL_CURRENT_BALANCE,
  INITIAL_SAVINGS_BALANCE,
  type ActivityIcon,
  type BankCard,
  type Loan,
  type Notification,
  type Transaction,
  type TransactionCategory,
  mockCards,
  mockLoans,
  mockNotifications,
  mockTransactions,
} from "@/lib/mock-data";
import { create } from "zustand";

type AccountBucket = "current" | "savings";

interface ActivityInput {
  type: Transaction["type"];
  category: TransactionCategory;
  title: string;
  description: string;
  amount: number;
  reference: string;
  icon: ActivityIcon;
  account?: AccountBucket;
  notification?: {
    type: Notification["type"];
    title: string;
    message: string;
    icon?: ActivityIcon;
  };
}

interface BankState {
  transactions: Transaction[];
  cards: BankCard[];
  loans: Loan[];
  notifications: Notification[];
  unreadCount: number;
  currentBalance: number;
  savingsBalance: number;

  toggleFreezeCard: (cardId: string) => void;
  setSpendingLimit: (cardId: string, limit: number) => void;
  markNotificationRead: (notifId: string) => void;
  markAllRead: () => void;
  addTransaction: (tx: Transaction, account?: AccountBucket) => void;
  postNotification: (notification: Notification) => void;
  recordActivity: (input: ActivityInput) => Transaction;
}

function nowDate(): string {
  return new Date().toISOString().split("T")[0];
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function buildNotificationId() {
  return `notif_${Date.now()}`;
}

function updateBalances(
  state: Pick<BankState, "currentBalance" | "savingsBalance" | "cards">,
  tx: Transaction,
  account: AccountBucket,
) {
  const amount = Math.abs(tx.amount);
  const delta = tx.type === "credit" ? amount : -amount;

  const currentBalance =
    account === "current"
      ? Math.max(0, state.currentBalance + delta)
      : state.currentBalance;
  const savingsBalance =
    account === "savings"
      ? Math.max(0, state.savingsBalance + delta)
      : state.savingsBalance;

  const cards = state.cards.map((card, index) => {
    if (index !== 0 || card.type !== "debit") return card;

    return {
      ...card,
      balance: Math.max(0, card.balance + delta),
      spentToday:
        tx.type === "debit" ? card.spentToday + amount : Math.max(0, card.spentToday - amount),
    };
  });

  return { currentBalance, savingsBalance, cards };
}

export const useBankStore = create<BankState>((set, get) => ({
  transactions: mockTransactions,
  cards: mockCards,
  loans: mockLoans,
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.isRead).length,
  currentBalance: INITIAL_CURRENT_BALANCE,
  savingsBalance: INITIAL_SAVINGS_BALANCE,

  toggleFreezeCard: (cardId: string) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c,
      ),
    }));
  },

  setSpendingLimit: (cardId: string, limit: number) => {
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId ? { ...c, spendingLimit: limit } : c,
      ),
    }));
  },

  markNotificationRead: (notifId: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === notifId ? { ...n, isRead: true } : n,
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  addTransaction: (tx: Transaction, account = "current") => {
    set((state) => {
      const next = updateBalances(state, tx, account);
      return {
        transactions: [tx, ...state.transactions],
        currentBalance: next.currentBalance,
        savingsBalance: next.savingsBalance,
        cards: next.cards,
      };
    });
  },

  postNotification: (notification: Notification) => {
    set((state) => {
      const notifications = [notification, ...state.notifications];
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });
  },

  recordActivity: (input: ActivityInput) => {
    const transaction: Transaction = {
      id: input.reference,
      type: input.type,
      category: input.category,
      title: input.title,
      description: input.description,
      amount: Math.abs(input.amount),
      date: nowDate(),
      time: nowTime(),
      reference: input.reference,
      status: "completed",
      icon: input.icon,
    };

    get().addTransaction(transaction, input.account ?? "current");

    if (input.notification) {
      get().postNotification({
        id: buildNotificationId(),
        type: input.notification.type,
        title: input.notification.title,
        message: input.notification.message,
        date: transaction.date,
        time: transaction.time,
        isRead: false,
        icon: input.notification.icon ?? input.icon,
      });
    }

    return transaction;
  },
}));
