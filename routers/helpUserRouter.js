const express = require("express");

const {
  createHelpUser,
  getHelpUser,
  updateHelpUserById,
  deleteHelpUserById,
} = require("../services/helpUserServices");

const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

router
  .route("/")
  .post( createHelpUser)
  .get(getHelpUser);

router
  .route("/:id")
  .patch(protect, allowedTo("admin"), updateHelpUserById)
  .delete(protect, allowedTo("admin"), deleteHelpUserById);

module.exports = router;
