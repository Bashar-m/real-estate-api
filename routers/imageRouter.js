const express = require("express");
const {
  addImagesToApartment,
  addImageToBanner,
  uploadApartmentImages,
  uploadBannerImage,
  deleteUserApartmentImage,
  deleteUserBannerImage,
  getImageById,
  addImageToHelpUser,
  uploadHelpUserImage,
  deleteHelpUserImage,
  uploadUserImage,
  addImageToUser,
  deleteUserImage,
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

//help user
router
  .route("/:id/helpUser")
  .post(protect, allowedTo("admin"), uploadHelpUserImage, addImageToHelpUser)
  .delete(protect, allowedTo("admin"), deleteHelpUserImage);

//users
router
  .route("/:id/user")
  .post(protect, uploadUserImage, addImageToUser)
  .delete(protect, deleteUserImage);

//get image for all
router.get("/:id", getImageById);

module.exports = router;
