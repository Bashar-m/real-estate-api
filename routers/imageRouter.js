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
  .post(uploadBannerImage, addImageToBanner)
  .get(getBannerImage)
  .delete(deleteUserBannerImage);

module.exports = router;
