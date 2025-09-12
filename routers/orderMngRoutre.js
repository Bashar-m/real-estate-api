const express = require("express");

const {
  getPendingApartmentList,
  reviewApartment,
  getRejectedApartmentList,
} = require("../services/orderManagement");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router.use(protect, allowedTo("admin"));
router.get("/rejected", getRejectedApartmentList);
router.get("/pending", getPendingApartmentList);
router.post("/:id/review", reviewApartment);


module.exports = router;
