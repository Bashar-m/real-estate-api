const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");


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

  res.status(201).json({ data: user.wishlist });
});

exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,

    { $pull: { wishlist: req.params.apartmentId } },
    { new: true }
  );

  res.status(204).json({ data: user.wishlist });
});

exports.getWishlist = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user._id).populate("wishlist");

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
