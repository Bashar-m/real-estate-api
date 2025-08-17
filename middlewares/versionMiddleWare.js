let sem = require("semver");

const versionMiddleware = (req, res, next) => {
  const clientVersion = req.headers["appversion"];
  const minVersion = '1.0.0';

  if (!clientVersion) {
    return res.status(400).json({ message: "Missing appVersion in headers" });
  }

  if (!minVersion) {
    return res.status(500).json({ message: "Server version not configured" });
  }

  if (sem.lt(clientVersion, minVersion)) {
    return res.status(426).json({ 
      message: `Client version ${clientVersion} is too old. Minimum supported version is ${minVersion}` 
    });
  }

  next();
};


module.exports = versionMiddleware;