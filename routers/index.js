const categoryRoute = require("./categoryRouter");
const apartmentRoute = require("./apartmentRouter");
const userRoute = require("./userRouter");
const authRoute = require("./authRouter");
const aboutUsRoute = require("./aboutUsRouter");
const contactInfoRouter = require("./contactInfoRouter");
const wishlistRouter = require("./wishlistRouter");

const mountRoutes = (app) => {
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/apartments", apartmentRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/aboutUs", aboutUsRoute);
  app.use("/api/v1/contact-info", contactInfoRouter);
  app.use("/api/v1/wishlist", wishlistRouter);
};

module.exports = mountRoutes;
