const express = require("express");

const {
  creatAboutUs,
  getAboutUs,
  updateAboutUsById,
  deleteAboutUsById,
} = require("../services/aboutUsServices");
const {
  createAboutUsValidator,
  updateAboutUsValidator,
  deleteAboutUsValidator,
} = require("../utils/validators/aboutUsValidator");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(protect, allowedTo("admin"), createAboutUsValidator, creatAboutUs)
  .get(getAboutUs);

router
  .route("/:id")
  .patch(protect, allowedTo("admin"), updateAboutUsValidator, updateAboutUsById)
  .delete(
    protect,
    allowedTo("admin"),
    deleteAboutUsValidator,
    deleteAboutUsById
  );

module.exports = router;
