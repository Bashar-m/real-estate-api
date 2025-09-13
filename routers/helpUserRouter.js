const express = require("express");

const {
  updateHelpUserById,
  uploadHelpUserImages,
  createHelpUser,
  getHelpUser,
  deleteHelpUserById,
} = require("../services/helpUserServices");

const {
  createHelpUserValidator,
  updateHelpUserValidator,
  deleteHelpUserValidator,
} = require("../utils/validators/helpUserValidator");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    allowedTo("admin"),
    uploadHelpUserImages,
    createHelpUserValidator,
    createHelpUser
  )
  .get(getHelpUser);

router
  .route("/:id")
  .patch(
    protect,
    allowedTo("admin"),
    uploadHelpUserImages,
    updateHelpUserValidator,
    updateHelpUserById
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteHelpUserValidator,
    deleteHelpUserById
  );

module.exports = router;
