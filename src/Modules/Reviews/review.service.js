import reviewModel from "../../DB/Models/review.model.js";
import orderModel from "../../DB/Models/order.model.js";
import productModel from "../../DB/Models/product.model.js";

const calcReviewForProduct = async (productId) => {
  const product = await productModel.findById(productId).populate("review");

  if (!product) return;

  const totalReviews = product.review.length;

  if (totalReviews === 0) {
    product.averageRating = 0;
    product.totalReviews = 0;
  } else {
    const sumRating = product.review.reduce((sum, r) => sum + r.raiting, 0);
    const avgRating = sumRating / totalReviews;
    product.averageRating = avgRating.toFixed(1);
    product.totalReviews = totalReviews;
  }

  await product.save();
  console.log(`Product ${productId} rating updated ✅`);
};

export const createReview = async (req, res, next) => {
  const productId = req.params._id;
  const { comment, raiting } = req.body;

  const order = await orderModel.findOne({
    userId: req.user._id,
    status: "delivered",
    "products.productId": productId,
  });

  if (!order)
    return next(
      new Error("You can only review delivered orders", { cause: 400 })
    );

  if (
    await reviewModel.findOne({
      createdBy: req.user._id,
      productId,
      orderId: order._id,
    })
  )
    return next(new Error("product already reviewd", { cause: 400 }));

  const review = await reviewModel.create({
    createdBy: req.user._id,
    orderId: order._id,
    productId,
    comment,
    raiting,
  });

  if (!review)
    return next(new Error("Unable to create your review", { cause: 400 }));

  await calcReviewForProduct(productId);
  return res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: review,
  });
};

export const updateReview = async (req, res, next) => {
  const productId = req.params.productId;
  const reviewId = req.params.reviewId;

  const review = await reviewModel.findOne({
    _id: reviewId,
    productId,
    createdBy: req.user._id,
  });

  if (!review) return next(new Error("can't find your review", { cause: 400 }));

  if (req.body.comment) review.comment = req.body.comment;

  if (req.body.raiting) review.raiting = req.body.raiting;

  await review.save();

  return res.status(200).json({
    success: true,
    message: "review updated successfully",
    data: review,
  });
};
