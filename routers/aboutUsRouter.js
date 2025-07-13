const express = require("express");

const {
  creatAboutUs,
  getAboutUs,
  updateAboutUsById,
  deleteAboutUsById,
} = require("../services/aboutUsServices");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(protect, allowedTo("admin"), creatAboutUs)
  .get(getAboutUs);

router
  .route("/:id")
  .put(protect, allowedTo("admin"), updateAboutUsById)
  .delete(protect, allowedTo("admin"), deleteAboutUsById);

module.exports = router;
