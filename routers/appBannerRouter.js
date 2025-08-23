const express = require("express");

const {
  createBanner,
  getBanner,
  updateBannerById,
  deleteBannerById,
  uploadBannerImages,
} = require("../services/appBannerServices");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(protect, allowedTo("admin"), uploadBannerImages, createBanner)
  .get(getBanner);

router
  .route("/:id")
  .patch(protect, allowedTo("admin"), uploadBannerImages, updateBannerById)
  .delete(protect, allowedTo("admin"), uploadBannerImages,deleteBannerById);

module.exports = router;
