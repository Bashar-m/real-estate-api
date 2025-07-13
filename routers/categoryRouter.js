const express = require("express");

const {
  creatCatrgory,
  getCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} = require("../services/categoryServices");

const {
  createCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");
const allowedTo = require("../middlewares/allowedTo");
const protect = require("../middlewares/protect");


const router = express.Router();

router
  .route("/")
  .post(protect, allowedTo("admin"), createCategoryValidator, creatCatrgory)
  .get(getCategory);

router
  .route("/:id")
  .get(getCategoryValidator, getCategoryById)
  .put(protect, allowedTo("admin"), updateCategoryValidator, updateCategoryById)
  .delete(
    protect,
    allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategoryById
  );

module.exports = router;
