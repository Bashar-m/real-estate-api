const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddlewares");

const categoryRoute = require("./routers/categoryRouter");
const apartmentRoute = require("./routers/apartmentRouter");
const userRoute = require("./routers/userRouter");
const authRoute = require("./routers/authRouter");
const aboutUsRoute = require("./routers/aboutUsRouter");
const contactInfoRouter = require("./routers/contactInfoRouter");
const wishlistRouter = require("./routers/wishlistRouter");

dotenv.config({ path: "config.env" });

dbConnection();

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/apartmens", apartmentRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/aboutUs", aboutUsRoute);
app.use("/api/v1/contact-info", contactInfoRouter);
app.use("/api/v1/wishlist", wishlistRouter);


app.all("/*path", (req, res, next) => {
  return next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT;
const HOST = "localhost";
app.listen(PORT, HOST, () => {
  console.log(`App running on http://${HOST}:${PORT}`);
});
