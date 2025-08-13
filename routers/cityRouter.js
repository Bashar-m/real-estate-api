const express = require("express");

const {
  creatCity,
  getCity,
  updateCityById,
  deleteCityById,
} = require("../services/cityServices");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router.route("/").post(protect, allowedTo("admin"), creatCity).get(getCity);

router
  .route("/:id")
  .patch(protect, allowedTo("admin"), updateCityById)
  .delete(protect, allowedTo("admin"), deleteCityById);

module.exports = router;
