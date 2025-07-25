
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json({ status: "success", data: document });
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);
    if (!document) return next(new ApiError("No document found", 404));
    res.status(200).json({ status: "success", data: document });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) return next(new ApiError("No document found", 404));
    res.status(200).json({ status: "success", data: document });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) return next(new ApiError("No document found", 404));
    res.status(204).json({ status: "success", message: "Deleted" });
  });

exports.getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .search()
      .limitfields();

    const countDocuments = await Model.countDocuments(features.getFilterObject());
    features.paginate(countDocuments);

    const docs = await features.mongooseQuery;

  

    res.status(200).json({
      status: "success",
      results: docs.length,
      pagination: features.paginationResult,
      data: docs,
    });
  });
