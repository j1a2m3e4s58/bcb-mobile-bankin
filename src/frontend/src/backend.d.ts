import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface LoginRequest {
    pin: string;
    phone: string;
}
export interface TransferRequest {
    transferType: string;
    network: string;
    description: string;
    fromAccountNumber: string;
    bankCode: string;
    amountPesewas: Amount;
    toAccountNumber: string;
}
export type Amount = bigint;
export interface TransactionRecord {
    id: string;
    counterpartyAccount: string;
    status: string;
    createdAt: Timestamp;
    reference: string;
    description: string;
    counterpartyName: string;
    amountPesewas: Amount;
    category: string;
    txType: string;
}
export interface NotificationRecord {
    id: string;
    title: string;
    notifType: string;
    body: string;
    createdAt: Timestamp;
    isRead: boolean;
}
export interface CardInfo {
    id: string;
    status: string;
    cardNetwork: string;
    expiryMonth: bigint;
    createdAt: Timestamp;
    expiryYear: bigint;
    maskedPan: string;
    dailyLimitPesewas: Amount;
    cardholderName: string;
    monthlyLimitPesewas: Amount;
}
export interface LoanApplicationRequest {
    loanType: string;
    termMonths: bigint;
    amountPesewas: Amount;
    purpose: string;
}
export interface RegisterRequest {
    pin: string;
    name: string;
    email: string;
    phone: string;
    ghanaCard: string;
}
export interface AccountInfo {
    id: string;
    balancePesewas: Amount;
    createdAt: Timestamp;
    isActive: boolean;
    accountType: string;
    accountNumber: string;
}
export interface PaymentRequest {
    meterOrSmartCard: string;
    description: string;
    amountPesewas: Amount;
    paymentType: string;
    accountNumber: string;
}
export interface LoanInfo {
    id: string;
    status: string;
    appliedAt: Timestamp;
    approvedAt?: Timestamp;
    interestRateBps: bigint;
    repaymentSchedule: Array<RepaymentScheduleEntry>;
    loanType: string;
    termMonths: bigint;
    principalPesewas: Amount;
    disbursedAt?: Timestamp;
}
export interface RepaymentScheduleEntry {
    dueDate: Timestamp;
    isPaid: boolean;
    amountPesewas: Amount;
    paidAt?: Timestamp;
}
export interface UserProfile {
    id: string;
    name: string;
    createdAt: Timestamp;
    email: string;
    kycStatus: string;
    phone: string;
    ghanaCard: string;
}
export enum AuthError {
    phoneAlreadyExists = "phoneAlreadyExists",
    userNotFound = "userNotFound",
    invalidPin = "invalidPin",
    unauthorized = "unauthorized"
}
export enum CardError {
    invalidLimit = "invalidLimit",
    alreadyFrozen = "alreadyFrozen",
    alreadyActive = "alreadyActive",
    cardNotFound = "cardNotFound",
    unauthorized = "unauthorized"
}
export enum LoanError {
    loanNotFound = "loanNotFound",
    alreadyApplied = "alreadyApplied",
    unauthorized = "unauthorized",
    invalidAmount = "invalidAmount"
}
export enum NotificationError {
    notificationNotFound = "notificationNotFound",
    unauthorized = "unauthorized"
}
export enum TransactionError {
    transferFailed = "transferFailed",
    insufficientFunds = "insufficientFunds",
    accountNotFound = "accountNotFound",
    unauthorized = "unauthorized",
    invalidAmount = "invalidAmount"
}
export interface backendInterface {
    applyForLoan(req: LoanApplicationRequest): Promise<{
        __kind__: "ok";
        ok: LoanInfo;
    } | {
        __kind__: "err";
        err: LoanError;
    }>;
    changePin(oldPin: string, newPin: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    freezeCard(cardId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: CardError;
    }>;
    getAccount(accountNumber: string): Promise<AccountInfo | null>;
    getCard(cardId: string): Promise<CardInfo | null>;
    getLoan(loanId: string): Promise<LoanInfo | null>;
    getMyAccounts(): Promise<Array<AccountInfo>>;
    getMyCards(): Promise<Array<CardInfo>>;
    getMyLoans(): Promise<Array<LoanInfo>>;
    getMyNotifications(): Promise<Array<NotificationRecord>>;
    getMyProfile(): Promise<UserProfile | null>;
    getMyTransactions(): Promise<Array<TransactionRecord>>;
    getTransaction(txId: string): Promise<TransactionRecord | null>;
    login(req: LoginRequest): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    makePayment(req: PaymentRequest): Promise<{
        __kind__: "ok";
        ok: TransactionRecord;
    } | {
        __kind__: "err";
        err: TransactionError;
    }>;
    markAllNotificationsRead(): Promise<void>;
    markNotificationRead(notifId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: NotificationError;
    }>;
    register(req: RegisterRequest): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    requestCard(networkText: string): Promise<CardInfo>;
    setSpendingLimits(cardId: string, dailyLimitPesewas: bigint, monthlyLimitPesewas: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: CardError;
    }>;
    transfer(req: TransferRequest): Promise<{
        __kind__: "ok";
        ok: TransactionRecord;
    } | {
        __kind__: "err";
        err: TransactionError;
    }>;
    unfreezeCard(cardId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: CardError;
    }>;
    updateMyProfile(name: string, email: string, ghanaCard: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
}
