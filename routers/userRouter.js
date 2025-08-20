const express = require("express");

const {
  createUser,
  getUsers,
  getUserById,
  getUserByIdForUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  uploadUserImages,
  resizeUserImages,
  getLoggedUserData,
  updateLoggedUserPass,
  updateLoggedUserData,
  deleteLoggedUserData,
  createUserApartment,
  uploadApartmentImages,
  getUserApartment,
  deleteUserImage,
  deleteUserApartment,
  updateUserApartment,
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

const parseCoordinatesMiddleware = require("../middlewares/parseCoordinates");

const router = express.Router();

// ************************** [User] **************************
router.use(protect);

router.get("/getMe", getLoggedUserData, getUserByIdForUser);
router.put(
  "/changeMyPassword",
  changeUserPasswordValidator,
  updateLoggedUserPass
);
router.patch("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUserData);

//**************************[User Apartment]************************** */
router.post(
  "/addApartment",
  parseCoordinatesMiddleware,
  uploadApartmentImages,
  createUserApartment
);

router.get("/getApartment", getUserApartment);
router.delete("/delete-image/:id", deleteUserImage);
router.delete("/delete-apartment/:id", deleteUserApartment);
router.patch("/update-apartment/:id", updateUserApartment);

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
  .patch(uploadUserImages, resizeUserImages, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
