const express = require("express");
const {
  addImagesToApartment,
  getApartmentImages,
  addImageToBanner,
  getBannerImage,
  uploadApartmentImages,
  uploadBannerImage,
} = require("../services/imageServices");
const router = express.Router();

//IMAGE
router
  .route("/:id/apartment")
  .post(uploadApartmentImages, addImagesToApartment)
  .get(getApartmentImages);

router
  .route("/:id/banner")
  .post(uploadBannerImage, addImageToBanner)
  .get(getBannerImage);
module.exports = router;
