module {
  public type Timestamp = Int;
  public type AccountNumber = Text;
  public type PhoneNumber = Text;
  public type Amount = Nat; // in pesewas (GHS * 100)

  public type Result<T, E> = { #ok : T; #err : E };
};
