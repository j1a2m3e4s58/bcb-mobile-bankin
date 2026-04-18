import Types "../types/notifications";
import NotifsLib "../lib/notifications";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  notifications : List.List<Types.Notification>,
) {
  public shared query ({ caller }) func getMyNotifications() : async [Types.NotificationRecord] {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func markNotificationRead(notifId : Text) : async { #ok; #err : Types.NotificationError } {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    Runtime.trap("not implemented");
  };
};
