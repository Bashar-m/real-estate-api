const Category = require("../models/categoryModel");

const {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOne,
} = require("../services/handlersFactory");

exports.creatCatrgory = createOne(Category);

exports.getCategory = getAll(Category);

exports.getCategoryById = getOne(Category);

exports.updateCategoryById = updateOne(Category);

exports.deleteCategoryById = deleteOne(Category);
