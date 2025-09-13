const express = require("express");

const {
  creatCity,
  getCity,
  updateCityById,
  deleteCityById,
} = require("../services/cityServices");

const {
  createCityValidator,
  updateCityValidator,
  deleteCityValidator,
} = require("../utils/validators/cityValidator");
const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(protect, allowedTo("admin"), createCityValidator, creatCity)
  .get(getCity);

router
  .route("/:id")
  .patch(protect, allowedTo("admin"), updateCityValidator, updateCityById)
  .delete(protect, allowedTo("admin"), deleteCityValidator, deleteCityById);

module.exports = router;
