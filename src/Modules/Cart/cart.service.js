import cartModel from "../../DB/Models/cart.model.js";
import productModel from "../../DB/Models/product.model.js";

const totalCartPrice = (cart) => {
  return cart.products.reduce((accum, current) => {
    return accum + current.price * current.quantity;
  }, 0);
};

export const addToCart = async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById(productId);

  if (!product) return next(new Error("In-Valid product Id", { cause: 400 }));

  if (product.stock < 1 || product.isDeleted) {
    await productModel.updateOne(
      { _id: productId },
      { $addToSet: { wishUserList: req.user._id } }
    );
    return next(new Error(`product is out of stock`), { cause: 400 });
  }

  const cart = await cartModel.findOne({ userId: req.user?._id });

  if (!cart) {
    const newCart = await cartModel.create({
      userId: req.user._id,
      products: [{ productId, quantity: 1, price: product.finalPrice }],
      totalPrice: product.price,
    });

    return res.status(201).json({
      success: true,
      message: "Cart created successfully",
      data: newCart,
    });
  }

  const updatedCart = await cartModel.findOneAndUpdate(
    { userId: req.user._id, "products.productId": productId },
    {
      $inc: { "products.$.quantity": 1 },
    },
    { new: true, runValidators: true }
  );

  if (updatedCart) {
    updatedCart.totalPrice = totalCartPrice(updatedCart);
    await updatedCart.save();

    return res.status(200).json({
      success: true,
      message: "product quantity increased successfully",
      data: updatedCart,
    });
  }

  const added = await cartModel.findOneAndUpdate(
    { userId: req.user._id },
    {
      $push: {
        products: { productId, quantity: 1, price: product.finalPrice },
      },
    },
    { new: true, runValidators: true }
  );

  added.totalPrice = totalCartPrice(added);
  await added.save();
  return res.status(200).json({
    success: true,
    message: "quantity increased successfully",
    data: added,
  });
};

export const removeFromCart = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const cart = await cartModel.findOne({ userId });

  if (!cart) return next(new Error("Your cart is empty", { cause: 400 }));

  const productExist = await productModel.findById(productId);
  if (!productExist)
    return next(new Error("Invalid product id", { cause: 400 }));

  const productExistInCart = cart.products.find(
    (p) => p.productId.toString() === productId
  );

  if (!productExistInCart)
    return next(new Error("Product is not in your cart", { cause: 400 }));

  cart.products = cart.products.filter(
    (p) => p.productId.toString() !== productId
  );

  await cart.save();

  return res.status(200).json({
    success: true,
    message: "Product removed successfully from your cart",
    data: cart,
  });
};

export const increaseQuantity = async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user._id;

  const cart = await cartModel.findOne({ userId });

  if (!cart || cart.products.length === 0)
    return next(new Error("your cart is empty", { cause: 400 }));

  const product = await productModel.findOne({ _id: productId });

  if (!product) return next(new Error("Product not found", { cause: 404 }));

  const item = cart.products.find(
    (i) => i.productId.toString() === productId.toString()
  );

  if (item.quantity + 1 > product.stock) {
    return next(
      new Error(`Only ${product.stock} items available`, { cause: 400 })
    );
  }
  const updatedCart = await cartModel.findOneAndUpdate(
    { userId, "products.productId": productId },
    { $inc: { "products.$.quantity": 1 } },
    { new: true, runValidators: true }
  );

  updatedCart.totalPrice = totalCartPrice(updatedCart);

  await updatedCart.save();

  return res.status(200).json({
    success: true,
    message: "product quantity increased successfully",
    data: updatedCart,
  });
};

export const decreaseQuantity = async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user._id;

  const cart = await cartModel.findOne({ userId });

  if (!cart || cart.products.length === 0)
    return next(new Error("your cart is empty", { cause: 400 }));

  const product = await productModel.findById(productId);

  if (!product) return next(new Error("Product not found", { cause: 404 }));

  const item = cart.products.find(
    (i) => i.productId.toString() === productId.toString()
  );

  if (item.quantity - 1 <= 0) {
    return next(new Error(`min quantity is 1`, { cause: 400 }));
  }
  const updatedCart = await cartModel.findOneAndUpdate(
    { userId, "products.productId": productId },
    { $inc: { "products.$.quantity": -1 } },
    { new: true, runValidators: true }
  );

  updatedCart.totalPrice = totalCartPrice(updatedCart);

  await updatedCart.save();

  return res.status(200).json({
    success: true,
    message: "product quantity decreased successfully",
    data: updatedCart,
  });
};

export const clearCart = async (req, res, next) => {
  const userId = req.user._id;

  const cart = await cartModel.findOne({ userId });
  if (!cart || cart.products.length === 0)
    return next(new Error("your cart is empty", { cause: 400 }));

  const newcart = await cartModel.findOneAndUpdate(
    { userId },
    { products: [], totalPrice: 0 },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "All cart items removed successfully",
    data: newcart,
  });
};

export const mergeCart = async (req, res, next) => {
  try {
    const { guestCart } = req.body;
    const userId = req.user._id;

    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      const guestProducts = [];
      for (const product of guestCart) {
        const productExist = await productModel.findById(product._id);
        if (!productExist)
          return next(new Error("Product might be deleted", { cause: 400 }));

        guestProducts.push({
          productId: productExist._id,
          quantity: product.quantity,
          price: productExist.finalPrice,
        });
      }

      cart = await cartModel.create({
        userId,
        products: guestProducts,
      });
    } else {
      // لو الكارت موجود، ندمج العناصر
      for (const guestItem of guestCart) {
        const product = await productModel.findById(guestItem._id);
        if (!product)
          return next(new Error("Product might be deleted", { cause: 400 }));

        const itemExist = cart.products.find(
          (item) => item.productId.toString() === guestItem._id.toString()
        );

        if (itemExist) {
          itemExist.quantity += guestItem.quantity;
          itemExist.price = product.finalPrice;
        } else {
          cart.products.push({
            productId: product._id,
            quantity: guestItem.quantity,
            price: product.finalPrice,
          });
        }
      }

      await cart.save();
    }

    // هنا نعمل populate عشان frontend يشوف كل بيانات المنتجات
    cart = await cart.populate({
      path: "products.productId",
      select: "name mainImage finalPrice price discount stock mainImage",
    });

    return res.status(200).json({
      success: true,
      message: "Cart merged successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCart = async (req, res, next) => {
  const userId = req.user._id;

  const cart = await cartModel
    .findOne({ userId })
    .populate("products.productId");

  if (!cart)
    return next(
      new Error("you don't have any items in your cart", { cause: 400 })
    );

  return res
    .status(200)
    .json({ success: true, message: "your cart :", data: cart });
};
