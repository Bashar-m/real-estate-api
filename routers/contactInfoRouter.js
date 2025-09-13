const express = require("express");

const {
  creatContactInfo,
  getContactInfo,
  updateContactInfoById,
  deleteContactInfoById,
} = require("../services/contactInfoServices");

const {
  createContactInfoValidator,
  updateContactInfoValidator,
  deleteContactInfoValidator,
} = require("../utils/validators/ContactInfoValidator");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    allowedTo("admin"),
    createContactInfoValidator,
    creatContactInfo
  )
  .get(getContactInfo);

router
  .route("/:id")
  .patch(
    protect,
    allowedTo("admin"),
    updateContactInfoValidator,
    updateContactInfoById
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteContactInfoValidator,
    deleteContactInfoById
  );

module.exports = router;
