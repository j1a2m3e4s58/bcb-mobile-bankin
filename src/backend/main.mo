import AuthTypes "types/auth";
import AccountTypes "types/accounts";
import TxTypes "types/transactions";
import CardTypes "types/cards";
import LoanTypes "types/loans";
import NotifTypes "types/notifications";
import AuthMixin "mixins/auth-api";
import AccountsMixin "mixins/accounts-api";
import TransactionsMixin "mixins/transactions-api";
import CardsMixin "mixins/cards-api";
import LoansMixin "mixins/loans-api";
import NotificationsMixin "mixins/notifications-api";
import List "mo:core/List";

actor {
  // --- Auth state ---
  let users = List.empty<AuthTypes.User>();
  let nextUserId : Nat = 0;

  // --- Accounts state ---
  let accounts = List.empty<AccountTypes.Account>();

  // --- Transactions state ---
  let transactions = List.empty<TxTypes.Transaction>();
  let nextTxId : Nat = 0;

  // --- Cards state ---
  let cards = List.empty<CardTypes.Card>();
  let nextCardId : Nat = 0;

  // --- Loans state ---
  let loans = List.empty<LoanTypes.Loan>();
  let nextLoanId : Nat = 0;

  // --- Notifications state ---
  let notifications = List.empty<NotifTypes.Notification>();
  let nextNotifId : Nat = 0;

  // --- Mixin composition ---
  include AuthMixin(users, nextUserId);
  include AccountsMixin(accounts);
  include TransactionsMixin(transactions, accounts, notifications, nextTxId, nextNotifId);
  include CardsMixin(cards, nextCardId);
  include LoansMixin(loans, nextLoanId);
  include NotificationsMixin(notifications);
};
