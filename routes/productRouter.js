import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} from "../controllers/productController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

// ✅ Handle both JSON and multipart form data
router.post("/", (req, res, next) => {
  // Check if request has files or is JSON
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Handle multipart form data with files
    upload.array("images", 4)(req, res, next);
  } else {
    // Handle JSON data without files
    next();
  }
}, createProduct);

router.put("/:id", (req, res, next) => {
  // Check if request has files or is JSON
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Handle multipart form data with files
    upload.array("images", 4)(req, res, next);
  } else {
    // Handle JSON data without files
    next();
  }
}, updateProduct);

router.delete("/:id", deleteProduct);

// Admin routes
router.get("/admin/stats", getProductStats);

export default router;


