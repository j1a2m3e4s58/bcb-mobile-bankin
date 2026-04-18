import Common "common";

module {
  public type UserId = Principal;
  public type Timestamp = Common.Timestamp;
  public type Amount = Common.Amount;

  public type LoanType = {
    #personal;
    #business;
    #mortgage;
  };

  public type LoanStatus = {
    #pending;
    #approved;
    #rejected;
    #disbursed;
    #repaid;
  };

  public type RepaymentScheduleEntry = {
    dueDate : Timestamp;
    amountPesewas : Amount;
    isPaid : Bool;
    paidAt : ?Timestamp;
  };

  public type Loan = {
    id : Text;
    userId : UserId;
    loanType : LoanType;
    var principalPesewas : Amount;
    var interestRateBps : Nat; // basis points e.g. 1500 = 15%
    var termMonths : Nat;
    var status : LoanStatus;
    var repaymentSchedule : [RepaymentScheduleEntry];
    appliedAt : Timestamp;
    var approvedAt : ?Timestamp;
    var disbursedAt : ?Timestamp;
  };

  // Shared version for API
  public type LoanInfo = {
    id : Text;
    loanType : Text;
    principalPesewas : Amount;
    interestRateBps : Nat;
    termMonths : Nat;
    status : Text;
    repaymentSchedule : [RepaymentScheduleEntry];
    appliedAt : Timestamp;
    approvedAt : ?Timestamp;
    disbursedAt : ?Timestamp;
  };

  public type LoanApplicationRequest = {
    loanType : Text;
    amountPesewas : Amount;
    termMonths : Nat;
    purpose : Text;
  };

  public type LoanError = {
    #loanNotFound;
    #unauthorized;
    #alreadyApplied;
    #invalidAmount;
  };
};
