const parseCoordinatesMiddleware = (req, res, next) => {
  if (
    req.body &&
    req.body.location &&
    req.body.location.coordinates &&
    Array.isArray(req.body.location.coordinates)
  ) {
    req.body.location.coordinates = req.body.location.coordinates.map((coord) =>
      Number(coord)
    );
  }
  next();
};

module.exports = parseCoordinatesMiddleware;
