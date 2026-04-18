import Types "../types/auth";
import AuthLib "../lib/auth";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  users : List.List<Types.User>,
  nextUserId : Nat,
) {
  public shared ({ caller }) func register(req : Types.RegisterRequest) : async { #ok; #err : Types.AuthError } {
    Runtime.trap("not implemented");
  };

  public shared func login(req : Types.LoginRequest) : async { #ok : Types.UserProfile; #err : Types.AuthError } {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func getMyProfile() : async ?Types.UserProfile {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func updateMyProfile(name : Text, email : Text, ghanaCard : Text) : async { #ok; #err : Types.AuthError } {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func changePin(oldPin : Text, newPin : Text) : async { #ok; #err : Types.AuthError } {
    Runtime.trap("not implemented");
  };
};
