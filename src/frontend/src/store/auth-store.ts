import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  accountNumber: string;
  accountType: AccountType;
  dateOfBirth: string;
  address: string;
  occupation: string;
  nextOfKin: string;
  branch: string;
  savingsBalance: number;
  currentBalance: number;
  avatarInitials: string;
  kycVerified: boolean;
  memberSince: string;
}

export type AccountType =
  | "Savings Account"
  | "Current Account"
  | "Student Account"
  | "Business Account"
  | "Susu / Group Savings";

export interface AccountApplication {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  ghanaCard: string;
  dateOfBirth: string;
  residentialAddress: string;
  occupation: string;
  nextOfKin: string;
  branch: string;
  accountType: AccountType;
  ghanaCardFrontUploaded: boolean;
  ghanaCardBackUploaded: boolean;
  selfieUploaded: boolean;
  status: "pending_review" | "approved" | "rejected";
  submittedAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  registeredUser: UserProfile | null;
  accountApplications: AccountApplication[];
  transactionPin: string | null;
  darkMode: boolean;
  login: (accountNumber: string, password: string) => Promise<boolean>;
  registerCustomer: (application: Omit<AccountApplication, "id" | "status" | "submittedAt">, password: string, pin: string) => Promise<UserProfile>;
  verifyTransactionPin: (pin: string) => boolean;
  logout: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const MOCK_USER: UserProfile = {
  name: "Kofi Mensah",
  phone: "0241234567",
  email: "kofi.mensah@gmail.com",
  accountNumber: "1234567890",
  accountType: "Savings Account",
  dateOfBirth: "1992-03-15",
  address: "14 Airport Rd, Accra, Ghana",
  occupation: "Trader",
  nextOfKin: "Ama Mensah - 0247654321",
  branch: "Bawjiase Market Branch",
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
      registeredUser: null,
      accountApplications: [],
      transactionPin: "1234",
      darkMode: false,

      login: async (accountNumber: string, _password: string) => {
        // Demo mode accepts any account number and password.
        await new Promise<void>((resolve) => setTimeout(resolve, 1200));
        const registeredUser = get().registeredUser;
        const user = registeredUser
          ? { ...registeredUser, accountNumber: accountNumber || registeredUser.accountNumber }
          : { ...MOCK_USER, accountNumber: accountNumber || MOCK_USER.accountNumber };
        set({ isAuthenticated: true, user });
        return true;
      },

      registerCustomer: async (application, _password, pin) => {
        await new Promise<void>((resolve) => setTimeout(resolve, 900));
        const names = application.fullName.trim().split(/\s+/);
        const initials = names
          .slice(0, 2)
          .map((name) => name[0]?.toUpperCase() ?? "")
          .join("") || "BC";
        const user: UserProfile = {
          name: application.fullName,
          phone: application.phone,
          email: application.email,
          accountNumber: `${Date.now()}`.slice(-10),
          accountType: application.accountType,
          dateOfBirth: application.dateOfBirth,
          address: application.residentialAddress,
          occupation: application.occupation,
          nextOfKin: application.nextOfKin,
          branch: application.branch,
          savingsBalance: 0,
          currentBalance: 0,
          avatarInitials: initials,
          kycVerified:
            application.ghanaCardFrontUploaded &&
            application.ghanaCardBackUploaded &&
            application.selfieUploaded,
          memberSince: new Date().toISOString().split("T")[0],
        };
        const accountApplication: AccountApplication = {
          ...application,
          id: `APP-${Date.now()}`,
          status: "pending_review",
          submittedAt: new Date().toISOString(),
        };
        set((state) => ({
          isAuthenticated: true,
          user,
          registeredUser: user,
          transactionPin: pin,
          accountApplications: [accountApplication, ...state.accountApplications],
        }));
        return user;
      },

      verifyTransactionPin: (pin: string) => {
        const expectedPin = get().transactionPin || "1234";
        return pin === expectedPin;
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
        registeredUser: state.registeredUser,
        accountApplications: state.accountApplications,
        transactionPin: state.transactionPin,
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
