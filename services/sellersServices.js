const Sellers = require("../models/sellersModel");

const {
  createOne,
  getAll,
  updateOne,
  deleteOne,
} = require("./handlersFactory");

exports.creatSellers = createOne(Sellers);

exports.getSellers = getAll(Sellers);

exports.updateSellersById = updateOne(Sellers);

exports.deleteSellersById = deleteOne(Sellers);
