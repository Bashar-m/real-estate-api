const city = require("../models/cityModle");

const {
  createOne,
  getAll,
  updateOne,
  deleteOne,
} = require("../services/handlersFactory");

exports.creatCity = createOne(city);

exports.getCity = getAll(city);

exports.updateCityById = updateOne(city);

exports.deleteCityById = deleteOne(city);
