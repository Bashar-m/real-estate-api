const asyncHandler = require("express-async-handler");

const Apartment = require("../models/apartmentModel");

const {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOne,
} = require("../services/handlersFactory");

const ApiFeatures = require("../utils/apiFeatures");
const ApiError = require("../utils/apiError");

exports.getPendingApartmentList = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(
    Apartment.find({ postStatus: "pending" }),
    req.query
  )
    .filter()
    .sort()
    .search()
    .limitfields();

  const countDocuments = await Apartment.find({
    postStatus: "pending",
  }).countDocuments(features.getFilterObject());
  features.paginate(countDocuments);

  const docs = await features.mongooseQuery;

  res.status(200).json({
    status: "success",
    results: docs.length,
    pagination: features.paginationResult,
    data: docs,
  });
});

exports.getRejectedApartmentList = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(
    Apartment.find({ postStatus: "rejected" }),
    req.query
  )
    .filter()
    .sort()
    .search()
    .limitfields();

  const countDocuments = await Apartment.find({
    postStatus: "rejected",
  }).countDocuments(features.getFilterObject());
  features.paginate(countDocuments);

  const docs = await features.mongooseQuery;

  res.status(200).json({
    status: "success",
    results: docs.length,
    pagination: features.paginationResult,
    data: docs,
  });
});

exports.reviewApartment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { status } = req.body;

  const apartment = await Apartment.findByIdAndUpdate(
    id,
    { postStatus: status },
    { new: true }
  );

  res.status(200).json({ status: "success", data: apartment });
});
exports.getApartmentById = getOne(Apartment);
