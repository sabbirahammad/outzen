import express from "express";
import { addToCart, getCart, removeFromCart, updateCartItem } from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Add to cart
router.post("/items", addToCart);

// Get cart
router.get("/", getCart);

// Update cart item quantity
router.put("/items/:itemId", updateCartItem);

// Remove item
router.delete("/items/:itemId", removeFromCart);

export default router;
