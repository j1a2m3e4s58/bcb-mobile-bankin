import Types "../types/transactions";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

module {
  public func getUserTransactions(
    _transactions : List.List<Types.Transaction>,
    _userId : Types.UserId,
  ) : [Types.TransactionRecord] {
    Runtime.trap("not implemented");
  };

  public func getTransaction(
    _transactions : List.List<Types.Transaction>,
    _txId : Text,
    _userId : Types.UserId,
  ) : ?Types.TransactionRecord {
    Runtime.trap("not implemented");
  };

  public func recordTransfer(
    _transactions : List.List<Types.Transaction>,
    _userId : Types.UserId,
    _req : Types.TransferRequest,
    _txId : Text,
    _now : Types.Timestamp,
  ) : Types.TransactionRecord {
    Runtime.trap("not implemented");
  };

  public func recordPayment(
    _transactions : List.List<Types.Transaction>,
    _userId : Types.UserId,
    _req : Types.PaymentRequest,
    _txId : Text,
    _now : Types.Timestamp,
  ) : Types.TransactionRecord {
    Runtime.trap("not implemented");
  };

  public func recordCredit(
    _transactions : List.List<Types.Transaction>,
    _userId : Types.UserId,
    _accountNumber : Text,
    _amountPesewas : Types.Amount,
    _description : Text,
    _category : Types.TransactionCategory,
    _txId : Text,
    _now : Types.Timestamp,
  ) : Types.TransactionRecord {
    Runtime.trap("not implemented");
  };

  public func categoryToText(_cat : Types.TransactionCategory) : Text {
    Runtime.trap("not implemented");
  };

  public func txTypeToText(_t : Types.TransactionType) : Text {
    Runtime.trap("not implemented");
  };

  public func statusToText(_s : Types.TransactionStatus) : Text {
    Runtime.trap("not implemented");
  };

  public func toPublic(_tx : Types.Transaction) : Types.TransactionRecord {
    Runtime.trap("not implemented");
  };
};
