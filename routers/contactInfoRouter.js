const express = require("express");

const {
  creatContactInfo,
  getContactInfo,
  updateContactInfoById,
  deleteContactInfoById,
} = require("../services/contactInfoServices");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(protect, allowedTo("admin"), creatContactInfo)
  .get(getContactInfo);

router
  .route("/:id")
  .put(protect, allowedTo("admin"), updateContactInfoById)
  .delete(protect, allowedTo("admin"), deleteContactInfoById);

module.exports = router;
