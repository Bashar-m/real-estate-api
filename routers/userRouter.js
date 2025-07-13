const express = require("express");

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  changeUserPassword,
  deleteUser,
  uploadUserImages,
  resizeUserImages,
  getLoggedUserData,
  updateLoggedUserPass,
  updateLoggedUserData,
  deleteLoggedUserData,
} = require("../services/userServices");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");
const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");

const router = express.Router();

// ************************** [User] **************************
router.use(protect);

router.get("/getMe", getLoggedUserData, getUserById);
router.put(
  "/changeMyPassword",
  changeUserPasswordValidator,
  updateLoggedUserPass
);
router.put("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUserData);

// ************************** [admin] **************************

router.use(protect, allowedTo("admin"));
router
  .route("/")
  .post(uploadUserImages, resizeUserImages, createUserValidator, createUser)
  .get(getUsers);

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/:id")
  .get(getUserValidator, getUserById)
  .put(uploadUserImages, resizeUserImages, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
