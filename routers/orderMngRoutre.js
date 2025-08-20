const express = require("express");

const {
  getPendingApartmentList,
  reviewApartment,
} = require("../services/orderManagement");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

// router.use(protect, allowedTo("admin"));

router.get("/", getPendingApartmentList);

router.post("/:id/review", reviewApartment);

// router
//   .route("/:id")
//   .patch(protect, allowedTo("admin"), updateContactInfoById)
//   .delete(protect, allowedTo("admin"), deleteContactInfoById);

module.exports = router;
