import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// 🟢 Add to cart
export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1, size = 'M' } = req.body;
    const userId = req.user?.id;

    console.log('🔑 Add to cart request for user:', userId);
    console.log('📦 Product ID:', product_id);
    console.log('📏 Size:', size);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // 1️⃣ Validate product_id
    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ success: false, message: "Invalid product_id" });
    }

    // 2️⃣ Validate size (default to 'M' if not provided)
    const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const itemSize = size && validSizes.includes(size) ? size : 'M';

    if (size && !validSizes.includes(size)) {
      return res.status(400).json({ success: false, message: "Invalid size. Must be S, M, L, XL, or XXL" });
    }

    // 2️⃣ Fetch product
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Get image from product
    const image = Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : '/no-image.svg'; // Return fallback path instead of null

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart with the item
      console.log('🛒 Creating new cart for user:', userId);
      cart = new Cart({
        userId,
        items: [{
          product_id,
          name: product.name,
          price: product.price,
          quantity,
          image,
          size: itemSize
        }],
      });
    } else {
      // Update existing cart items to have size field if missing
      cart.items = cart.items.map(item => ({
        ...item.toObject(),
        size: item.size || 'M' // Set default size for existing items
      }));
      // Check if product already exists in cart
      const existingItem = cart.items.find(
        item => item.product_id.toString() === product_id.toString()
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          product_id,
          name: product.name,
          price: product.price,
          quantity,
          image,
          size: itemSize
        });
      }
    }

    await cart.save();

    // ✅ Populate product details before sending response
    await cart.populate('items.product_id');

    // Ensure each cart item has proper image data
    const updatedItems = cart.items.map(item => {
      const product = item.product_id;
      const image = Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : '/no-image.svg';

      return {
        _id: item._id,
        product_id: product?._id || item.product_id,
        name: item.name || product?.name,
        price: item.price || product?.price,
        quantity: item.quantity,
        image: image
      };
    });

    res.status(200).json({
      success: true,
      cart: {
        ...cart.toObject(),
        items: updatedItems
      }
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟡 Get cart items
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    let cart = await Cart.findOne({ userId }).populate('items.product_id');

    if (!cart) {
      // Return empty cart if not found
      return res.json({
        success: true,
        cart: { userId, items: [] }
      });
    }

    // Ensure existing cart items have size field
    cart.items = cart.items.map(item => ({
      ...item.toObject(),
      size: item.size || 'M' // Set default size for existing items
    }));

    // Ensure each cart item has proper image data
    const updatedItems = cart.items.map(item => {
      const product = item.product_id;
      const image = Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : '/no-image.svg';

      return {
        _id: item._id,
        product_id: product?._id || item.product_id,
        name: item.name || product?.name,
        price: item.price || product?.price,
        quantity: item.quantity,
        image: image
      };
    });

    res.json({
      success: true,
      cart: {
        ...cart.toObject(),
        items: updatedItems
      }
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔵 Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    // ✅ Validate itemId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid itemId format" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Ensure existing cart items have size field
    cart.items = cart.items.map(item => ({
      ...item.toObject(),
      size: item.size || 'M' // Set default size for existing items
    }));

    // Ensure existing cart items have size field
    cart.items = cart.items.map(item => ({
      ...item.toObject(),
      size: item.size || 'M' // Set default size for existing items
    }));

    // Ensure existing cart items have size field
    cart.items = cart.items.map(item => ({
      ...item.toObject(),
      size: item.size || 'M' // Set default size for existing items
    }));

    // ✅ Find item using mongoose subdocument id() method
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    // Update quantity
    item.quantity = Math.max(1, quantity); // Minimum quantity 1
    await cart.save();

    // Populate before sending
    await cart.populate('items.product_id');

    // Ensure each cart item has proper image data
    const updatedItems = cart.items.map(item => {
      const product = item.product_id;
      const image = Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : '/no-image.svg';

      return {
        _id: item._id,
        product_id: product?._id || item.product_id,
        name: item.name || product?.name,
        price: item.price || product?.price,
        quantity: item.quantity,
        image: image
      };
    });

    res.json({
      success: true,
      cart: {
        ...cart.toObject(),
        items: updatedItems
      }
    });

  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔴 Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { itemId } = req.params;

    // ✅ Validate itemId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid itemId format" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // ✅ Find and remove item
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    // Use pull() method to remove subdocument
    cart.items.pull(itemId);
    await cart.save();

    // Populate before sending
    await cart.populate('items.product_id');

    // Ensure each cart item has proper image data
    const updatedItems = cart.items.map(item => {
      const product = item.product_id;
      const image = Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : '/no-image.svg';

      return {
        _id: item._id,
        product_id: product?._id || item.product_id,
        name: item.name || product?.name,
        price: item.price || product?.price,
        quantity: item.quantity,
        image: image
      };
    });

    res.json({
      success: true,
      cart: {
        ...cart.toObject(),
        items: updatedItems
      }
    });

  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟠 Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};