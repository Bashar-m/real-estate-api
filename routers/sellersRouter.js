const express = require("express");

const {
  creatSellers,
  getSellers,
  updateSellersById,
  deleteSellersById,
} = require("../services/sellersServices");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(protect, allowedTo("admin"), creatSellers)
  .get(protect, allowedTo("admin"), getSellers);

router
  .route("/:id")
  .patch(protect, allowedTo("admin"), updateSellersById)
  .delete(protect, allowedTo("admin"), deleteSellersById);

module.exports = router;
