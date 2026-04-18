import Types "../types/cards";
import CardsLib "../lib/cards";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  cards : List.List<Types.Card>,
  nextCardId : Nat,
) {
  public shared query ({ caller }) func getMyCards() : async [Types.CardInfo] {
    Runtime.trap("not implemented");
  };

  public shared query ({ caller }) func getCard(cardId : Text) : async ?Types.CardInfo {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func freezeCard(cardId : Text) : async { #ok; #err : Types.CardError } {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func unfreezeCard(cardId : Text) : async { #ok; #err : Types.CardError } {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func setSpendingLimits(cardId : Text, dailyLimitPesewas : Nat, monthlyLimitPesewas : Nat) : async { #ok; #err : Types.CardError } {
    Runtime.trap("not implemented");
  };

  public shared ({ caller }) func requestCard(networkText : Text) : async Types.CardInfo {
    Runtime.trap("not implemented");
  };
};
