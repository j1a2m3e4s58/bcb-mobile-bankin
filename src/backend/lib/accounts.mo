import Types "../types/accounts";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

module {
  public func getUserAccounts(
    _accounts : List.List<Types.Account>,
    _userId : Types.UserId,
  ) : [Types.AccountInfo] {
    Runtime.trap("not implemented");
  };

  public func getAccount(
    _accounts : List.List<Types.Account>,
    _accountNumber : Text,
    _userId : Types.UserId,
  ) : ?Types.AccountInfo {
    Runtime.trap("not implemented");
  };

  public func createAccount(
    _accounts : List.List<Types.Account>,
    _userId : Types.UserId,
    _accountNumber : Text,
    _accountType : Types.AccountType,
    _initialBalancePesewas : Types.Amount,
    _now : Types.Timestamp,
  ) : Types.AccountInfo {
    Runtime.trap("not implemented");
  };

  public func debit(
    _accounts : List.List<Types.Account>,
    _accountNumber : Text,
    _userId : Types.UserId,
    _amountPesewas : Types.Amount,
  ) : { #ok; #err : Types.AccountError } {
    Runtime.trap("not implemented");
  };

  public func credit(
    _accounts : List.List<Types.Account>,
    _accountNumber : Text,
    _amountPesewas : Types.Amount,
  ) : { #ok; #err : Types.AccountError } {
    Runtime.trap("not implemented");
  };

  public func toPublic(_account : Types.Account) : Types.AccountInfo {
    Runtime.trap("not implemented");
  };
};
