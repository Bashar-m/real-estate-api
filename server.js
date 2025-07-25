const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

// 🛡️ Security
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const helmet = require("helmet");
const cors = require("cors"); //تحديد النطاقات المسموح بها
//const hpp = require("hpp"); لا تدعم حاليا ex5

const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddlewares");
const logger = require("./utils/logger");

const mountRoutes = require("./routers");

dotenv.config({ path: "config.env" });

dbConnection();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:8080"], // دومين التطوير وعند انشاء دومين استضافه يجب اضافته هنا لاسمع لل api القادمه من هناك
    credentials: true,
  })
);
app.disable("x-powered-by");
// 👇 Middlewares
app.use(express.json({ limit: "20kb" }));
// express.urlencoded({ extended: true }) ما بحتاجها لان ما عندي صفحه html رح يوصلني منها بيانات حتى حللها
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
// 🛡️ الحماية الكاملة باستخدام helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-origin" }, // منع تحميل الموارد من خارج النطاق
  })
);

// 🧠 حماية CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // بدون inline سكربت
      styleSrc: ["'self'", "'unsafe-inline'"], // لأن بعض المكتبات تستخدم inline CSS مثل Tailwind
      imgSrc: ["'self'", "data:"], // الصور من السيرفر ومن base64
      fontSrc: ["'self'", "https:", "data:"], // لو تستخدم خطوط من CDN
      connectSrc: ["'self'"], // API فقط من نفس السيرفر
      objectSrc: ["'none'"], // منع Flash
      frameAncestors: ["'none'"], // منع العرض داخل iframe
      upgradeInsecureRequests: [], // اجبار استخدام https
    },
  })
);
app.use(xss());
app.use((req, res, next) => {
  // تنظيف req.body
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }

  // تنظيف req.query
  if (req.query) {
    req.query = mongoSanitize.sanitize(req.query);
  }

  // تنظيف req.params
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params);
  }

  next();
});
// بدل مكتبه hpp حتى يتم تحديثها ل EX5
app.use((req, res, next) => {
  for (const key in req.query) {
    if (
      Array.isArray(req.query[key]) &&
      !["bathrooms", "room", "price", "property_type"].includes(key)
    ) {
      req.query[key] = req.query[key][0]; // خذ أول قيمة فقط
    }
  }
  next();
});

// 👇 Mount routes
mountRoutes(app);

// 👇 Error handlers
app.all("/*path", (req, res, next) => {
  return next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

// 👇 Server
// 🚀 تشغيل الخادم
const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0"; // مناسب للإنتاج

const server = app.listen(PORT, HOST, () => {
  logger.info(`App running on http://${HOST}:${PORT}`);
});

// ⚠️ التعامل مع الوعود غير الملتقطة
process.on("unhandledRejection", (err) => {
  logger.error(`UnhandledRejection: ${err.name} | ${err.message}`);
  server.close(() => {
    logger.error("Shutting down gracefully...");
    process.exit(1);
  });
});
