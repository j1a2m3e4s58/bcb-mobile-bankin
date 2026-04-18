import Types "../types/accounts";
import AccountsLib "../lib/accounts";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  accounts : List.List<Types.Account>,
) {
  public shared query ({ caller }) func getMyAccounts() : async [Types.AccountInfo] {
    Runtime.trap("not implemented");
  };

  public shared query ({ caller }) func getAccount(accountNumber : Text) : async ?Types.AccountInfo {
    Runtime.trap("not implemented");
  };
};
