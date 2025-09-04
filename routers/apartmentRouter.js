const express = require("express");

const {
  createApartment,
  getApartmentList,
  getApartmentByMap,
  getApartmentById,
  updateapartmentById,
  deleteApartmentById,
  uploadApartmentImages,
  //resizeApartmentImages,
  AddFeatureApartment,
} = require("../services/apartmentServices");

const {
  createApartmentValidator,
  getApartmentValidator,
  updateApartmentValidator,
  deleteApartmentValidator,
} = require("../utils/validators/apartmentValidator");
const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");
const parseCoordinatesMiddleware = require("../middlewares/parseCoordinates");
const { add } = require("winston");

const router = express.Router();

router.route("/list").get(getApartmentList);
router.route("/map").get(getApartmentByMap);
router.route("/").post(
  protect,
  parseCoordinatesMiddleware,
  uploadApartmentImages,
  // resizeApartmentImages,
  createApartmentValidator,
  createApartment
);

//add Feature apartment
router.post("/:id/feature", protect, allowedTo("admin"), AddFeatureApartment);

router
  .route("/:id")
  .get(getApartmentValidator, getApartmentById)
  .patch(
    protect,
    allowedTo("admin"),
    updateApartmentValidator,
    updateapartmentById
  )
  .delete(
    protect,
    deleteApartmentValidator,
    deleteApartmentById
  );

module.exports = router;
