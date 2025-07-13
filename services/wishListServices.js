const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Apartment = require("../models/apartmentModel");

exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
        wishlist: req.body.apartmentId,
      },
    },
    {
      new: true,
    }
  );

  await Apartment.findByIdAndUpdate(req.body.apartmentId, {
    $addToSet: {
      interestedUsers: req.user._id,
    },
  });

  res
    .status(201)
    .json({ message: "Added to wishlist", wishlist: user.wishlist });
});

exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,

    { $pull: { wishlist: req.params.apartmentId } },
    { new: true }
  );

  await Apartment.findByIdAndUpdate(
    req.params.apartmentId,
    {
      $pull: { interestedUsers: req.user._id },
    },
    { new: true }
  );

  res.status(200).json({
    message: "Removed from wishlist",
    wishlist: user.wishlist,
  });
});

exports.getWishlist = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    select: "-interestedUsers",
  });

  const totalItems = user.wishlist.length;
  const paginatedWishlist = user.wishlist.slice(skip, skip + limit);
  const numberOfPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    status: "success",
    results: paginatedWishlist.length,
    pagination: {
      currentPage: page,
      limit,
      numberOfPages,
    },
    data: paginatedWishlist,
  });
});
