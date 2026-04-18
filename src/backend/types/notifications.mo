import Common "common";

module {
  public type UserId = Principal;
  public type Timestamp = Common.Timestamp;

  public type NotificationType = {
    #transactionAlert;
    #loanUpdate;
    #cardAlert;
    #systemMessage;
    #promotionalOffer;
  };

  public type Notification = {
    id : Text;
    userId : UserId;
    notifType : NotificationType;
    title : Text;
    body : Text;
    var isRead : Bool;
    createdAt : Timestamp;
  };

  // Shared version for API
  public type NotificationRecord = {
    id : Text;
    notifType : Text;
    title : Text;
    body : Text;
    isRead : Bool;
    createdAt : Timestamp;
  };

  public type NotificationError = {
    #notificationNotFound;
    #unauthorized;
  };
};
