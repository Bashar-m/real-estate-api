const express = require("express");
const {
  addImagesToApartment,
  getApartmentImages,
  addImageToBanner,
  getBannerImage,
  uploadApartmentImages,
  uploadBannerImage,
  deleteUserApartmentImage,
  deleteUserBannerImage,
  getImageBiId,
} = require("../services/imageServices");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");
const router = express.Router();

//IMAGE

//Apartment
router
  .route("/:id/apartment")
  .post(uploadApartmentImages, addImagesToApartment)
  .delete(deleteUserApartmentImage);

//Banner
router
  .route("/:id/banner")
  .post(protect, allowedTo("admin"), uploadBannerImage, addImageToBanner)
  .delete(protect, allowedTo("admin"), deleteUserBannerImage);

//get image for all
router.get("/:id", getImageBiId);

module.exports = router;
