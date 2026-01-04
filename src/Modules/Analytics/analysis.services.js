import mongoose from "mongoose";
import orderModel from "../../DB/Models/order.model.js";
import productModel from "../../DB/Models/product.model.js";

export const dashboardOverview = async (req, res, next) => {
  const ordersStats = await orderModel.aggregate([
    {
      $match: {
        status: "delivered",
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$finalPrice" },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const productsStats = await productModel.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $facet: {
        activeProducts: [{ $match: { isActive: true } }, { $count: "count" }],

        lowStockProducts: [
          {
            $match: {
              stock: { $gt: 0, $lte: 10 },
            },
          },
          { $count: "count" },
        ],

        outOfStock: [
          {
            $match: {
              stock: 0,
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  return res.status(200).json({
    totalSales: ordersStats[0]?.totalSales || 0,
    totalOrders: ordersStats[0]?.totalOrders || 0,
    activeProducts: productsStats[0].activeProducts[0]?.count || 0,
    lowStockProducts: productsStats[0].lowStockProducts[0]?.count || 0,
    outOfStock: productsStats[0].outOfStock[0]?.count || 0,
  });
};

export const dashboardRevenueVsOrders = async (req, res, next) => {
  const ordersRevenueStats = await orderModel.aggregate([
    { $match: { status: "delivered" } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalSales: { $sum: "$finalPrice" },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    // { $count: "totalcount" },
  ]);

  return res.json({ totalSales: ordersRevenueStats });
};

export const salesByCategory = async (req, res, next) => {
  const data = await orderModel.aggregate([
    { $match: { status: "delivered" } },
    {
      $unwind: "$products",
    },

    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "product",
      },
    },

    {
      $unwind: "$product",
    },

    {
      $lookup: {
        from: "categories",
        localField: "product.categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },

    {
      $group: {
        _id: "$category._id",
        categoryName: { $first: "$category.name" },
        totalRevenue: { $sum: "$products.finalPrice" },
        totalItemsSold: { $sum: "$products.quantity" },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  res.json({ data });
};

export const topProducts = async (req, res, next) => {
  const data = await orderModel.aggregate([
    { $match: { status: "delivered" } },

    { $unwind: "$products" },

    {
      $group: {
        _id: "$products.productId",
        name: { $first: "$products.name" },
        totalItemsSold: { $sum: "$products.quantity" },
        totalItemsRevenue: { $sum: "$products.finalPrice" },
      },
    },

    { $sort: { totalItemsSold: -1 } },

    { $limit: 6 },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },

    {
      $unwind: "$product",
    },
  ]);

  res.json({ data });
};

export const orderStatus = async (req, res, next) => {
  const data = await orderModel.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const statuses = [
    "pending",
    "preparing",
    "ready_to_ship",
    "shipped",
    "shipping_failed",
    "delivered",
    "cancelled",
    "returned",
  ];

  const result = {};
  statuses.forEach((status) => {
    const found = data.find((item) => item._id === status);
    result[status] = found ? found.count : 0;
  });

  res.json(result);
};

export const bestSoldProductsOfSpecificSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.params;

  const data = await orderModel.aggregate([
    { $match: { status: "delivered" } },

    { $unwind: "$products" },

    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    {
      $match: {
        "product.subcategoryId": new mongoose.Types.ObjectId(subCategoryId),
        "product.isDeleted": false,
        "product.isActive": true,
      },
    },

    {
      $group: {
        _id: "$product._id",
        name: { $first: "$product.name" },
        price: { $first: "$product.price" },
        image: { $first: "$product.mainImage.secure_url" },
        finalPrice: { $first: "$product.finalPrice" },
        discount: { $first: "$product.discount" },
        totalSold: { $sum: "$products.quantity" },
      },
    },

    { $sort: { totalSold: -1 } },

    { $limit: 10 },
  ]);

  return res.json({
    success: true,
    message: "Top 10 best sold products in this subcategory",
    data,
  });
};
