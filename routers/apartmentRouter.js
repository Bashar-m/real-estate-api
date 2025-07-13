const express = require("express");

const {
  createApartment,
  getApartmentList,
  getApartmentByMap,
  getApartmentById,
  updateapartmentById,
  deleteApartmentById,
  uploadApartmentImages,
  resizeApartmentImages,
} = require("../services/apartmentServices");

const {
  createApartmentValidator,
  getApartmentValidator,
  updateApartmentValidator,
  deleteApartmentValidator,
} = require("../utils/validators/apartmentValidator");
const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router.route("/list").get(getApartmentList);
router.route("/map").get(getApartmentByMap);
router.route("/").post(
  protect,
  allowedTo("admin"), //new edit hear for auth
  uploadApartmentImages,
  resizeApartmentImages,
  createApartmentValidator,
  createApartment
);
router
  .route("/:id")
  .get(getApartmentValidator, getApartmentById)
  .put(
    protect,
    allowedTo("admin"),
    updateApartmentValidator,
    updateapartmentById
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteApartmentValidator,
    deleteApartmentById
  );

module.exports = router;
