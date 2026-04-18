import Types "../types/loans";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

module {
  public func getUserLoans(
    _loans : List.List<Types.Loan>,
    _userId : Types.UserId,
  ) : [Types.LoanInfo] {
    Runtime.trap("not implemented");
  };

  public func getLoan(
    _loans : List.List<Types.Loan>,
    _loanId : Text,
    _userId : Types.UserId,
  ) : ?Types.LoanInfo {
    Runtime.trap("not implemented");
  };

  public func applyForLoan(
    _loans : List.List<Types.Loan>,
    _userId : Types.UserId,
    _req : Types.LoanApplicationRequest,
    _loanId : Text,
    _now : Types.Timestamp,
  ) : Types.LoanInfo {
    Runtime.trap("not implemented");
  };

  public func buildRepaymentSchedule(
    _principalPesewas : Types.Amount,
    _interestRateBps : Nat,
    _termMonths : Nat,
    _startDate : Types.Timestamp,
  ) : [Types.RepaymentScheduleEntry] {
    Runtime.trap("not implemented");
  };

  public func loanTypeToText(_t : Types.LoanType) : Text {
    Runtime.trap("not implemented");
  };

  public func statusToText(_s : Types.LoanStatus) : Text {
    Runtime.trap("not implemented");
  };

  public func toPublic(_loan : Types.Loan) : Types.LoanInfo {
    Runtime.trap("not implemented");
  };
};
