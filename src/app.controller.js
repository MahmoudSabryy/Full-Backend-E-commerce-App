import globalErrorHandler from "../utils/Error Handling/globalErrorHandler.js";
import notFoundHandler from "../utils/Error Handling/notFoundHandler.js";
import connectDB from "./DB/connection.js";
import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import productRouter from "./Modules/Product/product.controller.js";
import cartRouter from "./Modules/Cart/cart.controller.js";
import categoryRouter from "./Modules/Category/category.controller.js";
import subCategoryRouter from "./Modules/Sub-Category/subcategory.controller.js";
import orderRouter from "./Modules/Order/order.controller.js";
import reviewRouter from "./Modules/Reviews/review.controller.js";
import couponRouter from "./Modules/Coupon/coupon.controller.js";
import brandRouter from "./Modules/Brand/brand.controller.js";
import subsubcategoryRouter from "../src/Modules/sub-subcategory/sub-subcategory.controller.js";
import analysisRouter from "../src/Modules/Analytics/analysis.controller.js";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

const bootstrap = async (app, express) => {
  app.use(morgan("dev"));

  await connectDB();

  const whiteList = ["https://full-frontend-e-commerce.vercel.app"];
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || whiteList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));
  app.use(helmet());

  app.use((req, res, next) => {
    if (req.originalUrl === "/order/webhook") {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  app.get("/", (req, res) => res.send("Hello world"));

  app.use("/auth", authRouter);

  app.use("/user", userRouter);

  app.use("/product", productRouter);

  app.use("/cart", cartRouter);

  app.use("/category", categoryRouter);

  app.use("/subcategory", subCategoryRouter);

  app.use("/order", orderRouter);

  app.use("/review", reviewRouter);

  app.use("/coupon", couponRouter);

  app.use("/brand", brandRouter);

  app.use("/subsubcategory", subsubcategoryRouter);

  app.use("/analysis", analysisRouter);

  app.all(/.*/, notFoundHandler);

  app.use(globalErrorHandler);
};
export default bootstrap;
