const express = require("express");

const {
  updateHelpUserById,
  uploadHelpUserImages,
  createHelpUser,
  getHelpUser,
  deleteHelpUserById,
} = require("../services/helpUserServices");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post(protect, allowedTo("admin"), uploadHelpUserImages, createHelpUser)
  .get(getHelpUser);

router
  .route("/:id")
  .patch(protect, allowedTo("admin"), uploadHelpUserImages, updateHelpUserById)
  .delete(protect, allowedTo("admin"), deleteHelpUserById);

module.exports = router;
