import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import AdminPage from "@/pages/AdminPage";
import BranchesPage from "@/pages/BranchesPage";
import CardsPage from "@/pages/CardsPage";
import DashboardPage from "@/pages/DashboardPage";
import DisputesPage from "@/pages/DisputesPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import LoansPage from "@/pages/LoansPage";
import LoginPage from "@/pages/LoginPage";
import NotificationsPage from "@/pages/NotificationsPage";
import OtpPage from "@/pages/OtpPage";
import PaymentsPage from "@/pages/PaymentsPage";
import ProfilePage from "@/pages/ProfilePage";
import RegisterPage from "@/pages/RegisterPage";
import SplashPage from "@/pages/SplashPage";
import StatementsPage from "@/pages/StatementsPage";
import SupportPage from "@/pages/SupportPage";
import TransactionsPage from "@/pages/TransactionsPage";
import TransfersPage from "@/pages/TransfersPage";
import { useAuthStore } from "@/store/auth-store";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
    </>
  ),
});

// Auth guard helper
function requireAuth() {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (!isAuthenticated) {
    throw redirect({ to: "/login" });
  }
}

// Splash
const splashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SplashPage,
});

// Auth routes (no bottom nav)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const otpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/otp",
  component: OtpPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});

// Protected layout route
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-layout",
  beforeLoad: () => requireAuth(),
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const transfersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/transfers",
  component: TransfersPage,
});

const paymentsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/payments",
  component: PaymentsPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/transactions",
  component: TransactionsPage,
});

const statementsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/statements",
  component: StatementsPage,
});

const disputesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/disputes",
  component: DisputesPage,
});

const cardsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/cards",
  component: CardsPage,
});

const loansRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/loans",
  component: LoansPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const supportRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/support",
  component: SupportPage,
});

const branchesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/branches",
  component: BranchesPage,
});

const adminRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  splashRoute,
  loginRoute,
  registerRoute,
  otpRoute,
  forgotPasswordRoute,
  appLayoutRoute.addChildren([
    dashboardRoute,
    transfersRoute,
    paymentsRoute,
    transactionsRoute,
    statementsRoute,
    disputesRoute,
    cardsRoute,
    loansRoute,
    notificationsRoute,
    profileRoute,
    supportRoute,
    branchesRoute,
    adminRoute,
  ]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  history: createHashHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
