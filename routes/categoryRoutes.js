import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategoriesForNavbar,
  uploadCategoryImage,
} from "../controllers/categoryController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Get all categories for navbar (returns allcategories structure)
router.get("/", getAllCategoriesForNavbar);

// Get all categories (admin)
router.get("/admin", getAllCategories);

// Get all subcategories
router.get("/subcategory", getAllCategories);

// Get category by ID
router.get("/:id", getCategoryById);

// Upload image for category
router.patch("/:id/image", upload.single("image"), uploadCategoryImage);

// Create new category
router.post("/", createCategory);

// Create subcategory
router.post("/subcategory", createCategory);

// Update category
router.put("/:id", updateCategory);

// Delete category
router.delete("/:id", deleteCategory);

export default router;