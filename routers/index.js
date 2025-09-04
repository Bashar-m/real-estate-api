const categoryRoute = require("./categoryRouter");
const apartmentRoute = require("./apartmentRouter");
const userRoute = require("./userRouter");
const authRoute = require("./authRouter");
const aboutUsRoute = require("./aboutUsRouter");
const contactInfoRouter = require("./contactInfoRouter");
const wishlistRouter = require("./wishlistRouter");
const cityRouter = require("./cityRouter");
const sellersRouter = require("./sellersRouter");
const orderMngRoutre = require("./orderMngRoutre");
const appBannerRoutre = require("./appBannerRouter");
const imageRouter = require("./imageRouter");
const helpUserRouter = require("./helpUserRouter");

const mountRoutes = (app) => {
  app.use(require("../middlewares/versionMiddleWare"));
  app.use(require("../middlewares/userMiddleware"));
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/apartments", apartmentRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/aboutUs", aboutUsRoute);
  app.use("/api/v1/contact-info", contactInfoRouter);
  app.use("/api/v1/wishlist", wishlistRouter);
  app.use("/api/v1/city", cityRouter);
  app.use("/api/v1/sellers", sellersRouter);
  app.use("/api/v1/post-order", orderMngRoutre);
  app.use("/api/v1/banner", appBannerRoutre);
  app.use("/api/v1/images", imageRouter);
  app.use("/api/v1/helpUser", helpUserRouter);
};

module.exports = mountRoutes;
