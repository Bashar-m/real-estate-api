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
  getApartmentImages,
  addImagesToApartment,
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

const router = express.Router();

router.route("/list").get(getApartmentList);
router.route("/map").get(getApartmentByMap);
router.route("/").post(
  protect,
  allowedTo("admin"),
  parseCoordinatesMiddleware,
  uploadApartmentImages,
  // resizeApartmentImages,
  createApartmentValidator,
  createApartment
);

//IMAGE 
router
  .route("/:id/images")
  .post(uploadApartmentImages, addImagesToApartment)
  .get(getApartmentImages)
  

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
    allowedTo("admin"),
    deleteApartmentValidator,
    deleteApartmentById
  );

module.exports = router;
