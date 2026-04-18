import Common "common";

module {
  public type UserId = Principal;
  public type Timestamp = Common.Timestamp;
  public type Amount = Common.Amount;

  public type CardNetwork = {
    #visa;
    #mastercard;
  };

  public type CardStatus = {
    #active;
    #frozen;
    #expired;
  };

  public type Card = {
    id : Text;
    userId : UserId;
    var cardNetwork : CardNetwork;
    maskedPan : Text; // e.g. "**** **** **** 4532"
    cardholderName : Text;
    expiryMonth : Nat;
    expiryYear : Nat;
    var status : CardStatus;
    var dailyLimitPesewas : Amount;
    var monthlyLimitPesewas : Amount;
    createdAt : Timestamp;
  };

  // Shared version for API
  public type CardInfo = {
    id : Text;
    cardNetwork : Text;
    maskedPan : Text;
    cardholderName : Text;
    expiryMonth : Nat;
    expiryYear : Nat;
    status : Text;
    dailyLimitPesewas : Amount;
    monthlyLimitPesewas : Amount;
    createdAt : Timestamp;
  };

  public type CardError = {
    #cardNotFound;
    #unauthorized;
    #alreadyFrozen;
    #alreadyActive;
    #invalidLimit;
  };
};
