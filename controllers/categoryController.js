import Category from "../models/categoryModel.js";
import { v2 as cloudinary } from "cloudinary";

// Get all categories for admin
export const getAllCategories = async (req, res) => {
  try {
    const { subcategory } = req.query;

    let query = {};
    if (subcategory === 'true') {
      // For subcategories, filter by category_id (subcategories have a category_id)
      query = { category_id: { $ne: null, $ne: "" } };
    }

    const categories = await Category.find(query).lean();
    const formattedCategories = categories.map(category => ({
      id: category._id.toString(),
      name: category.name || category.title,
      title: category.title,
      image: category.image,
      category_id: category.category_id,
      sub_category_id: category.sub_category_id,
    }));

    if (subcategory === 'true') {
      res.json(formattedCategories);
    } else {
      res.json({ success: true, categories: formattedCategories });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const formatted = {
      id: category._id.toString(),
      title: category.title,
      items: category.items,
      image: category.image,
    };

    res.json({ success: true, category: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Upload image for category
export const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const imageUrl = req.file.path; // Cloudinary URL

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { image: imageUrl },
      { new: true }
    ).lean();

    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const formatted = {
      id: category._id.toString(),
      name: category.name || category.title,
      image: category.image,
    };

    res.json({ success: true, category: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, title, items, id, image, category_id, sub_category_id } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    if (!name && !title) {
      return res.status(400).json({ success: false, message: "Category name or title is required" });
    }

    const category = new Category({
      name,
      title,
      items: items || [],
      id,
      image,
      category_id,
      sub_category_id,
    });

    const saved = await category.save();
    const formatted = {
      id: saved._id.toString(),
      name: saved.name || saved.title,
      image: saved.image,
    };

    res.status(201).json({ success: true, category: formatted });
  } catch (err) {
    console.error("Category creation error:", err);

    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    // Handle mongoose duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }

    // Handle mongoose cast errors (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    // Handle all other errors
    const errorMessage = err.message || 'An error occurred while creating the category';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { name, title, items, id, image, category_id, sub_category_id } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, title, items, id, image, category_id, sub_category_id },
      { new: true }
    ).lean();

    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const formatted = {
      id: category._id.toString(),
      name: category.name || category.title,
      image: category.image,
    };

    res.json({ success: true, category: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    // Delete image from Cloudinary if exists
    if (category.image) {
      try {
        const parts = category.image.split("/");
        if (parts.length >= 2) {
          let publicId = parts.slice(-2).join("/").split(".")[0];
          if (/^v\d+\//.test(publicId)) {
            publicId = publicId.split("/").slice(1).join("/");
          }
          if (publicId && publicId.trim() !== "") {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      } catch (err) {
        console.warn("Failed to delete image from Cloudinary:", category.image, err.message);
      }
    }

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all categories for navbar (returns the allcategories structure)
export const getAllCategoriesForNavbar = async (req, res) => {
  try {
    const categories = await Category.find({}).lean();
    const allcategories = categories.map(category => ({
      title: category.title,
      items: category.items,
      id: category.id,
      image: category.image,
    }));
    res.json(allcategories);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};