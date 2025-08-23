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
} = require("../services/imageServices");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");
const router = express.Router();

//IMAGE

//Apartment
router
  .route("/:id/apartment")
  .post(uploadApartmentImages, addImagesToApartment)
  .get(getApartmentImages)
  .delete(deleteUserApartmentImage);

//Banner
router
  .route("/:id/banner")
  .post(protect, allowedTo("admin"), uploadBannerImage, addImageToBanner)
  .get(getBannerImage)
  .delete(protect, allowedTo("admin"), deleteUserBannerImage);

module.exports = router;
