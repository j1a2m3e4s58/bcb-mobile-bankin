import Types "../types/auth";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

module {
  public func register(
    _users : List.List<Types.User>,
    _req : Types.RegisterRequest,
    _id : Types.UserId,
    _now : Types.Timestamp,
  ) : { #ok; #err : Types.AuthError } {
    Runtime.trap("not implemented");
  };

  public func login(
    _users : List.List<Types.User>,
    _req : Types.LoginRequest,
  ) : { #ok : Types.UserId; #err : Types.AuthError } {
    Runtime.trap("not implemented");
  };

  public func getProfile(
    _users : List.List<Types.User>,
    _id : Types.UserId,
  ) : ?Types.UserProfile {
    Runtime.trap("not implemented");
  };

  public func updateProfile(
    _users : List.List<Types.User>,
    _id : Types.UserId,
    _name : Text,
    _email : Text,
    _ghanaCard : Text,
  ) : { #ok; #err : Types.AuthError } {
    Runtime.trap("not implemented");
  };

  public func changePin(
    _users : List.List<Types.User>,
    _id : Types.UserId,
    _oldPin : Text,
    _newPin : Text,
  ) : { #ok; #err : Types.AuthError } {
    Runtime.trap("not implemented");
  };

  public func toPublic(_user : Types.User) : Types.UserProfile {
    Runtime.trap("not implemented");
  };
};
