const HelpUser = require("../models/helpUserModel");

const {
  createOne,
  getAll,
  updateOne,
  deleteOne,
} = require("./handlersFactory");

exports.createHelpUser = createOne(HelpUser);

exports.getHelpUser = getAll(HelpUser);

exports.updateHelpUserById = updateOne(HelpUser);

exports.deleteHelpUserById = deleteOne(HelpUser);
