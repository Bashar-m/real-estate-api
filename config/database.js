const mongoose = require("mongoose");
const logger = require("../utils/logger");

const dbConnection = () => {
  mongoose.connect(process.env.DB_URL).then((conn) => {
    logger.info(`Database Connected: ${conn.connection.host}`);
  });
};

module.exports = dbConnection;
