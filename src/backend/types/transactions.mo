import Common "common";

module {
  public type UserId = Principal;
  public type Timestamp = Common.Timestamp;
  public type Amount = Common.Amount;

  public type TransactionType = {
    #credit;
    #debit;
  };

  public type TransactionCategory = {
    #intraTransfer;
    #interbankTransfer;
    #mobileMoney;
    #utilityPayment;
    #tvSubscription;
    #airtimeData;
    #loanDisbursement;
    #loanRepayment;
    #deposit;
    #withdrawal;
  };

  public type TransactionStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type Transaction = {
    id : Text;
    userId : UserId;
    txType : TransactionType;
    category : TransactionCategory;
    amountPesewas : Amount;
    description : Text;
    reference : Text;
    status : TransactionStatus;
    createdAt : Timestamp;
    // counterparty info
    counterpartyName : Text;
    counterpartyAccount : Text;
  };

  // Shared version for API (same fields, all immutable)
  public type TransactionRecord = {
    id : Text;
    txType : Text;
    category : Text;
    amountPesewas : Amount;
    description : Text;
    reference : Text;
    status : Text;
    createdAt : Timestamp;
    counterpartyName : Text;
    counterpartyAccount : Text;
  };

  public type TransferRequest = {
    fromAccountNumber : Text;
    toAccountNumber : Text;
    amountPesewas : Amount;
    description : Text;
    transferType : Text; // "intra" | "interbank" | "momo"
    network : Text; // "" | "MTN" | "Vodafone" | "AirtelTigo"
    bankCode : Text; // for interbank
  };

  public type PaymentRequest = {
    accountNumber : Text;
    amountPesewas : Amount;
    paymentType : Text; // "ecg" | "water" | "dstv" | "gotv" | "airtime" | "data"
    meterOrSmartCard : Text;
    description : Text;
  };

  public type TransactionError = {
    #insufficientFunds;
    #accountNotFound;
    #unauthorized;
    #invalidAmount;
    #transferFailed;
  };
};
