import Types "../types/notifications";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

module {
  public func getUserNotifications(
    _notifications : List.List<Types.Notification>,
    _userId : Types.UserId,
  ) : [Types.NotificationRecord] {
    Runtime.trap("not implemented");
  };

  public func markAsRead(
    _notifications : List.List<Types.Notification>,
    _notifId : Text,
    _userId : Types.UserId,
  ) : { #ok; #err : Types.NotificationError } {
    Runtime.trap("not implemented");
  };

  public func markAllAsRead(
    _notifications : List.List<Types.Notification>,
    _userId : Types.UserId,
  ) : () {
    Runtime.trap("not implemented");
  };

  public func addNotification(
    _notifications : List.List<Types.Notification>,
    _userId : Types.UserId,
    _notifType : Types.NotificationType,
    _title : Text,
    _body : Text,
    _notifId : Text,
    _now : Types.Timestamp,
  ) : () {
    Runtime.trap("not implemented");
  };

  public func notifTypeToText(_t : Types.NotificationType) : Text {
    Runtime.trap("not implemented");
  };

  public func toPublic(_n : Types.Notification) : Types.NotificationRecord {
    Runtime.trap("not implemented");
  };
};
