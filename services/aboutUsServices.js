const AboutUs = require("../models/aboutUsModel");

const {
  createOne,
  getAll,
  updateOne,
  deleteOne,
} = require("../services/handlersFactory");

exports.creatAboutUs = createOne(AboutUs);

exports.getAboutUs = getAll(AboutUs);

exports.updateAboutUsById = updateOne(AboutUs);

exports.deleteAboutUsById = deleteOne(AboutUs);