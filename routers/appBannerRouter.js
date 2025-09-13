const express = require("express");

const {
  createBanner,
  getBanner,
  updateBannerById,
  deleteBannerById,
  uploadBannerImages,
} = require("../services/appBannerServices");

const {
  createAppBannerValidator,
  updateAppBannerValidator,
  deleteAppBannerValidator,
} = require("../utils/validators/appBannerValidator");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    allowedTo("admin"),
    uploadBannerImages,
    createAppBannerValidator,
    createBanner
  )
  .get(getBanner);

router
  .route("/:id")
  .patch(
    protect,
    allowedTo("admin"),
    uploadBannerImages,
    updateAppBannerValidator,
    updateBannerById
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteAppBannerValidator,
    deleteBannerById
  );

module.exports = router;
