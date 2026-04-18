import Types "../types/cards";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

module {
  public func getUserCards(
    _cards : List.List<Types.Card>,
    _userId : Types.UserId,
  ) : [Types.CardInfo] {
    Runtime.trap("not implemented");
  };

  public func getCard(
    _cards : List.List<Types.Card>,
    _cardId : Text,
    _userId : Types.UserId,
  ) : ?Types.CardInfo {
    Runtime.trap("not implemented");
  };

  public func freezeCard(
    _cards : List.List<Types.Card>,
    _cardId : Text,
    _userId : Types.UserId,
  ) : { #ok; #err : Types.CardError } {
    Runtime.trap("not implemented");
  };

  public func unfreezeCard(
    _cards : List.List<Types.Card>,
    _cardId : Text,
    _userId : Types.UserId,
  ) : { #ok; #err : Types.CardError } {
    Runtime.trap("not implemented");
  };

  public func setSpendingLimits(
    _cards : List.List<Types.Card>,
    _cardId : Text,
    _userId : Types.UserId,
    _dailyLimitPesewas : Types.Amount,
    _monthlyLimitPesewas : Types.Amount,
  ) : { #ok; #err : Types.CardError } {
    Runtime.trap("not implemented");
  };

  public func requestCard(
    _cards : List.List<Types.Card>,
    _userId : Types.UserId,
    _cardNetwork : Types.CardNetwork,
    _cardholderName : Text,
    _cardId : Text,
    _now : Types.Timestamp,
  ) : Types.CardInfo {
    Runtime.trap("not implemented");
  };

  public func networkToText(_n : Types.CardNetwork) : Text {
    Runtime.trap("not implemented");
  };

  public func statusToText(_s : Types.CardStatus) : Text {
    Runtime.trap("not implemented");
  };

  public func toPublic(_card : Types.Card) : Types.CardInfo {
    Runtime.trap("not implemented");
  };
};
