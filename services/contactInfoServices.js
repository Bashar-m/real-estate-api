const ContactInfo = require("../models/ContactInfoModel");

const {
  createOne,
  getAll,
  updateOne,
  deleteOne,
} = require("../services/handlersFactory");

exports.creatContactInfo = createOne(ContactInfo);

exports.getContactInfo = getAll(ContactInfo);

exports.updateContactInfoById = updateOne(ContactInfo);

exports.deleteContactInfoById = deleteOne(ContactInfo);