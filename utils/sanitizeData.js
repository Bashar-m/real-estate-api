exports.sanitizeUser = function (user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: `${user.phone.replace(/^0+/, "")}`,
    phoneCountryCode: user.phoneCountryCode,
    active: user.active,
    isEmailVerified: user.isEmailVerified,
  };
};
