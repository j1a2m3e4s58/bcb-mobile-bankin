import TxTypes "../types/transactions";
import AccTypes "../types/accounts";
import TxLib "../lib/transactions";
import AccLib "../lib/accounts";
import NotifsLib "../lib/notifications";
import NotifsTypes "../types/notifications";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  transactions : List.List<TxTypes.Transaction>,
  accounts : List.List<AccTypes.Account>,
  notifications : List.List<NotifsTypes.Notification>,
  nextTxId : Nat,
  nextNotifId : Nat,
) {
  public shared query ({ caller }) func getMyTransactions() : async [TxTypes.TransactionRecord] {
    Runtime.trap("not implemented");
  };

  public shared query ({ caller }) func getTransaction(txId : Text) : async ?TxTypes.TransactionRecord {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func transfer(req : TxTypes.TransferRequest) : async { #ok : TxTypes.TransactionRecord; #err : TxTypes.TransactionError } {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func makePayment(req : TxTypes.PaymentRequest) : async { #ok : TxTypes.TransactionRecord; #err : TxTypes.TransactionError } {
    Runtime.trap("not implemented");
  };
};
