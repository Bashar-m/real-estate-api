const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const allowedTo = (...allowedRoles) =>
  asyncHandler((req, res, next) => {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }

    next();
  });

module.exports = allowedTo;
