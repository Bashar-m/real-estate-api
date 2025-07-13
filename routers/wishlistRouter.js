const express = require("express");

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../services/wishListServices");
const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

// ************************** [User] **************************
router.use(protect, allowedTo("user"));
router.route("/").post(addToWishlist).get(getWishlist);
router.delete("/:apartmentId", removeFromWishlist);

module.exports = router;
