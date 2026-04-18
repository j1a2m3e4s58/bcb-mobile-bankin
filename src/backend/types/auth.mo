import Common "common";

module {
  public type UserId = Principal;
  public type Timestamp = Common.Timestamp;

  public type KycStatus = {
    #pending;
    #verified;
    #rejected;
  };

  public type User = {
    id : UserId;
    var name : Text;
    var phone : Text;
    var email : Text;
    var ghanaCard : Text;
    var pin : Text;
    var kycStatus : KycStatus;
    var createdAt : Timestamp;
  };

  // Shared (no var) version for API
  public type UserProfile = {
    id : Text;
    name : Text;
    phone : Text;
    email : Text;
    ghanaCard : Text;
    kycStatus : Text;
    createdAt : Timestamp;
  };

  public type RegisterRequest = {
    name : Text;
    phone : Text;
    email : Text;
    ghanaCard : Text;
    pin : Text;
  };

  public type LoginRequest = {
    phone : Text;
    pin : Text;
  };

  public type AuthError = {
    #invalidPin;
    #userNotFound;
    #phoneAlreadyExists;
    #unauthorized;
  };
};
