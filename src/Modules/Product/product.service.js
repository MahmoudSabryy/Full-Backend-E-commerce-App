import slugify from "slugify";
import brandModel from "../../DB/Models/brand.model.js";
import productModel from "../../DB/Models/product.model.js";
import subcategoryModel from "../../DB/Models/subCategory.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../../utils/file uploading/cloudinary.js";
import UserModel from "../../DB/Models/user.model.js";

export const addProduct = async (req, res, next) => {
  const { name, categoryId, subcategoryId, brandId, price, discount } =
    req.body;

  if (!(await subcategoryModel.findOne({ _id: subcategoryId, categoryId })))
    return next(new Error("In-Valid Category or Sub-Category", { cause: 400 }));
  if (!(await brandModel.findById(brandId)))
    return next(new Error("In-Valid brand", { cause: 400 }));

  req.body.slug = slugify(name, { lower: true });

  req.body.finalPrice = price - (price * (discount || 0)) / 100;

  req.body.customId = nanoid();

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    {
      folder: `${process.env.APP_NAME}/product/${req.body.customId}`,
    }
  );
  req.body.mainImage = { secure_url, public_id };

  if (req.files.subImages) {
    req.body.subImages = [];
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.APP_NAME}/product/${req.body.customId}`,
        }
      );
      req.body.subImages.push({ secure_url, public_id });
    }
  }
  req.body.createdBy = req.user._id;
  const product = await productModel.create(req.body);

  if (!product)
    return next(new Error("Can't create this product", { cause: 400 }));

  return res.status(201).json({
    success: true,
    message: `product added successfully `,
    data: product,
  });
};

export const updateProduct = async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById(productId);

  if (!product) return next(new Error("Product not found", { cause: 404 }));

  if (req.body.name) {
    req.body.name = req.body.name.toLowerCase();

    if (product.name.toLowerCase() === req.body.name)
      return next(
        new Error("product name is the same old name", { cause: 400 })
      );

    product.name = req.body.name;
    product.slug = slugify(req.body.name, { lower: true });
  }

  if (req.body.description) {
    if (
      product.description.toLowerCase() === req.body.description.toLowerCase()
    )
      return next(
        new Error("product description is the same old description", {
          cause: 400,
        })
      );

    product.description = req.body.description;
  }

  if (req.body.price) {
    if (product.price == req.body.price)
      return next(
        new Error("product price is the same old price", { cause: 400 })
      );

    product.price = req.body.price;
  }

  if (req.body.stock) {
    if (product.stock == req.body.stock)
      return next(
        new Error("product stock is the same old stock", { cause: 400 })
      );

    product.stock = req.body.stock;
  }

  if (req.body.discount) {
    if (product.discount == req.body.discount)
      return next(
        new Error("product discount is the same old discount", { cause: 400 })
      );

    product.discount = req.body.discount;
  }

  product.finalPrice = product.price - (product.price * product.discount) / 100;

  if (req.body.colors) {
    for (const color of req.body.colors) {
      if (product.colors.includes(color))
        return next(
          new Error("product color is the same old color", { cause: 400 })
        );
      product.colors.push(color);
    }
  }

  if (req.body.size) {
    for (const size of req.body.size) {
      console.log(size);

      if (product.size.includes(size))
        return next(
          new Error("product size is the same old size", { cause: 400 })
        );

      product.size.push(size);
    }
  }

  if (req.files.mainImage) {
    await cloudinary.uploader.destroy(product.mainImage.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.mainImage[0].path,
      { folder: `${process.env.APP_NAME}/product/${product.customId}` }
    );

    product.mainImage = { secure_url, public_id };
  }

  if (req.files.subImages) {
    for (const img of product.subImages) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    product.subImages = [];

    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: `${process.env.APP_NAME}/product/${product.customId}` }
      );

      product.subImages.push({ secure_url, public_id });
    }
  }

  if (req.body.categoryId && req.body.subcategoryId) {
    const subCategory = await subcategoryModel.findOne({
      _id: req.body.subcategoryId,
      categoryId: req.body.categoryId,
    });

    if (!subCategory)
      return next(
        new Error("In-Valid category or sub-category or deosn't match", {
          cause: 400,
        })
      );

    if (
      product.categoryId.toString() === req.body.categoryId.toString() &&
      product.subcategoryId.toString() === req.body.subcategoryId.toString()
    ) {
      return next(
        new Error("Category and sub-category are the same as old values", {
          cause: 400,
        })
      );
    }

    product.categoryId = req.body.categoryId;
    product.subcategoryId = req.body.subcategoryId;
  }

  if (req.body.brandId) {
    if (!(await brandModel.findById(req.body.brandId)))
      return next(new Error("In-Valid brand Id", { cause: 400 }));

    if (product.brandId.toString() === req.body.brandId.toString())
      return next(
        new Error("Can't update brand with the same old brand", { cause: 400 })
      );

    product.brandId = req.body.brandId;
  }
  product.updatedBy = req.user._id;

  await product.save();

  return res.status(200).json({
    success: true,
    message: `product updated successfully`,
    data: product,
  });
};

export const getAllProducts = async (req, res, next) => {
  if (req.user?.role === "user") {
    const products = await productModel
      .find({ isDeleted: false, isActive: true })
      .populate("brandId categoryId subcategoryId", "name")
      .sort({ stock: -1 });
    return res.status(200).json({
      success: true,
      message: "All products :",
      data: products,
    });
  } else {
    const products = await productModel
      .find()
      .populate("brandId categoryId subcategoryId", "name")
      .sort({ stock: -1 });
    return res.status(200).json({
      success: true,
      message: "All products :",
      data: products,
    });
  }
};

export const getAllPaginatedProducts = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: "All products :",
    data: res.paginatedResults,
  });
};

export const getAllProductsByCategorySlug = async (req, res, next) => {
  const categorySlug = req.params.categorySlug.toLowerCase();

  if (!categorySlug)
    return next(new Error("Category slug is required", { cause: 400 }));

  const products = await productModel
    .find()
    .populate("categoryId", "slug image -_id")
    .sort({ stock: -1 });

  const filteredProducts = products.filter(
    (product) => product.categoryId.slug.toLowerCase() === categorySlug
  );
  return res.status(200).json({
    success: true,
    message: `All related products to this category :`,
    data: filteredProducts,
  });
};

export const getAllProductsBySubCategorySlug = async (req, res, next) => {
  const subCategorySlug = req.params.subCategorySlug.toLowerCase();

  if (!subCategorySlug)
    return next(new Error("subCategory slug is required", { cause: 400 }));

  const products = await productModel
    .find()
    .populate("subcategoryId", "slug image name -_id")
    .sort({ stock: -1 });

  const filteredProducts = products.filter(
    (product) => product.subcategoryId.slug.toLowerCase() === subCategorySlug
  );
  return res.status(200).json({
    success: true,
    message: `All related products to this Sub-category :`,
    data: filteredProducts,
  });
};

export const getAllProductsByBrandSlugAndId = async (req, res, next) => {
  const brandSlug = req.params.brandSlug.toLowerCase();
  const brandId = req.params.brandId;

  if (!brandSlug)
    return next(new Error("brand slug is required", { cause: 400 }));

  const products = await productModel
    .find()
    .populate("brandId")
    .sort({ stock: -1 });

  const filteredProducts = products.filter(
    (product) =>
      product.brandId.slug.toLowerCase() === brandSlug &&
      product.brandId._id.toString() === brandId
  );
  return res.status(200).json({
    success: true,
    message: `All related products to this brand :`,
    data: filteredProducts,
  });
};

export const getProductById = async (req, res, next) => {
  const productId = req.params.productId;

  const product = await productModel.findById(productId);
  if (!product)
    return next(new Error("product not found or deleted ", { cause: 404 }));

  return res
    .status(200)
    .json({ success: true, message: `All product details :`, data: product });
};

export const addtoWishlist = async (req, res, next) => {
  const productId = req.params.productId;
  const product = await productModel.findById(productId);

  if (!product) return next(new Error("product not found", { cause: 404 }));

  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishList: product._id } },
    { new: true, runValidators: true }
  ).select("wishList");

  if (!user)
    return next(
      new Error("can't add this product to your wishlist", { cause: 400 })
    );

  return res.status(200).json({
    success: true,
    message: "product added to your wishlist",
    data: user,
  });
};

export const removeFromWishlist = async (req, res, next) => {
  const productId = req.params.productId;
  const product = await productModel.findById(productId);

  if (!product) return next(new Error("product not found", { cause: 404 }));

  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishList: product._id } },
    { new: true, runValidators: true }
  ).select("wishList");

  if (!user)
    return next(
      new Error("can't add this product to your wishlist", { cause: 400 })
    );

  return res.status(200).json({
    success: true,
    message: "product removed from your wishlist",
    data: user,
  });
};

export const softDeleteProduct = async (req, res, next) => {
  const productId = req.params._id;

  const product = await productModel.findOneAndUpdate(
    {
      _id: productId,
      isDeleted: false,
    },
    { isDeleted: true, isActive: false },
    { new: true, runValidators: true }
  );

  if (!product)
    return next(new Error("can't find this product", { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${product.name} deleted successfully`,
    data: product,
  });
};

export const unDeleteProduct = async (req, res, next) => {
  const productId = req.params._id;

  const product = await productModel.findOneAndUpdate(
    {
      _id: productId,
      isDeleted: true,
    },
    { isDeleted: false, isActive: true },
    { new: true, runValidators: true }
  );

  if (!product)
    return next(new Error("can't find this product", { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${product.name} Enabled successfully`,
    data: product,
  });
};

export const getAllProductsBySlug = async (req, res, next) => {
  const productsSlug = req.params.productsSlug.toLowerCase();

  const products = await productModel.find({
    isDeleted: false,
    isActive: true,
    stock: { $gte: 1 },
  });
  const filteredProducts = products.filter(
    (product) =>
      product.slug.includes(productsSlug) ||
      product.description.toLowerCase().includes(productsSlug)
  );
  return res.status(200).json({
    success: true,
    message: "All matched products :",
    data: filteredProducts,
  });
};
