import {
  type BankCard,
  type Loan,
  type Notification,
  type Transaction,
  mockCards,
  mockLoans,
  mockNotifications,
  mockTransactions,
} from "@/lib/mock-data";
import { create } from "zustand";

interface BankState {
  transactions: Transaction[];
  cards: BankCard[];
  loans: Loan[];
  notifications: Notification[];
  unreadCount: number;

  // Card actions
  toggleFreezeCard: (cardId: string) => void;
  setSpendingLimit: (cardId: string, limit: number) => void;

  // Notification actions
  markNotificationRead: (notifId: string) => void;
  markAllRead: () => void;

  // Transaction actions
  addTransaction: (tx: Transaction) => void;
}

export const useBankStore = create<BankState>((set, get) => ({
  transactions: mockTransactions,
  cards: mockCards,
  loans: mockLoans,
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.isRead).length,

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

  addTransaction: (tx: Transaction) => {
    set((state) => ({
      transactions: [tx, ...state.transactions],
    }));
    // suppress unused warning
    void get;
  },
}));
