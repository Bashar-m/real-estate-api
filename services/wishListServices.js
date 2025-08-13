const asyncHandler = require("express-async-handler");
const Wishlist = require("../models/wishlistModel");
const Apartment = require("../models/apartmentModel");

// ➕ إضافة إلى المفضلة
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { apartmentId } = req.body;

  await Wishlist.findOneAndUpdate(
    { user: req.user._id, apartment: apartmentId },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Apartment.findOneAndUpdate({isFavorite : true});

  res.status(201).json({ message: "Added to wishlist" });
});

// ➖ إزالة من المفضلة
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { apartmentId } = req.params;

  await Wishlist.findOneAndDelete({
    user: req.user._id,
    apartment: apartmentId,
  });

  res.status(200).json({ message: "Removed from wishlist" });
});

// 📄 جلب المفضلة مع Pagination وإرجاع الشقق فقط
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalItems = await Wishlist.countDocuments({ user: req.user._id });

  const wishlistDocs = await Wishlist.find({ user: req.user._id })
    .populate("apartment")
    .skip(skip)
    .limit(limit);

  const numberOfPages = Math.ceil(totalItems / limit);

  const apartments = wishlistDocs.map((doc) => doc.apartment);

  res.status(200).json({
    status: "success",
    results: apartments.length,
    pagination: {
      currentPage: page,
      limit,
      numberOfPages,
    },
    data: apartments,
  });
});
