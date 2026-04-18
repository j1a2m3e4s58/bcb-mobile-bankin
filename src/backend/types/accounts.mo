import Common "common";

module {
  public type UserId = Principal;
  public type Timestamp = Common.Timestamp;
  public type Amount = Common.Amount;

  public type AccountType = {
    #savings;
    #current;
  };

  public type Account = {
    id : Text;
    userId : UserId;
    accountNumber : Text;
    var accountType : AccountType;
    var balancePesewas : Amount; // balance in pesewas
    var isActive : Bool;
    createdAt : Timestamp;
  };

  // Shared version for API
  public type AccountInfo = {
    id : Text;
    accountNumber : Text;
    accountType : Text;
    balancePesewas : Amount;
    isActive : Bool;
    createdAt : Timestamp;
  };

  public type AccountError = {
    #accountNotFound;
    #insufficientFunds;
    #unauthorized;
  };
};
