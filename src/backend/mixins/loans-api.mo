import Types "../types/loans";
import LoansLib "../lib/loans";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  loans : List.List<Types.Loan>,
  nextLoanId : Nat,
) {
  public shared query ({ caller }) func getMyLoans() : async [Types.LoanInfo] {
    Runtime.trap("not implemented");
  };

  public shared query ({ caller }) func getLoan(loanId : Text) : async ?Types.LoanInfo {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func applyForLoan(req : Types.LoanApplicationRequest) : async { #ok : Types.LoanInfo; #err : Types.LoanError } {
    Runtime.trap("not implemented");
  };
};
