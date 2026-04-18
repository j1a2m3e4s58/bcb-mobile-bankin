import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  accountNumber: string;
  savingsBalance: number;
  currentBalance: number;
  avatarInitials: string;
  kycVerified: boolean;
  memberSince: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  darkMode: boolean;
  login: (phone: string, pin: string) => Promise<boolean>;
  logout: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const MOCK_USER: UserProfile = {
  name: "Kofi Mensah",
  phone: "0241234567",
  email: "kofi.mensah@gmail.com",
  accountNumber: "1234567890",
  savingsBalance: 4250.0,
  currentBalance: 12800.5,
  avatarInitials: "KM",
  kycVerified: true,
  memberSince: "2022-03-15",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      darkMode: false,

      login: async (_phone: string, _pin: string) => {
        // Accept any phone/pin combination for testing
        await new Promise<void>((resolve) => setTimeout(resolve, 1200));
        set({ isAuthenticated: true, user: MOCK_USER });
        return true;
      },

      logout: () => {
        set({ isAuthenticated: false, user: null });
      },

      toggleDarkMode: () => {
        const newValue = !get().darkMode;
        set({ darkMode: newValue });
        if (newValue) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      setDarkMode: (value: boolean) => {
        set({ darkMode: value });
        if (value) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }),
    {
      name: "bcb-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        darkMode: state.darkMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add("dark");
        }
      },
    },
  ),
);
