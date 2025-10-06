import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";

// সব প্রোডাক্ট fetch
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).lean(); // lean() use করলাম
    const formattedProducts = products.map(p => ({
      id: p._id.toString(), // _id → id
      name: p.name,
      price: p.price,
      category: p.category,
      images: p.images,
      isTrending: p.isTrending,
      isTopProduct: p.isTopProduct,
      description: p.description,
      oldPrice: p.oldPrice || null,
    }));
    res.json({ success: true, products: formattedProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// একক প্রোডাক্ট fetch
export const getProductById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ success: false, message: "Product not found" });

    const product = {
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      category: p.category,
      images: p.images,
      isTrending: p.isTrending,
      isTopProduct: p.isTopProduct,
      description: p.description,
      oldPrice: p.oldPrice || null,
    };

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// create product
export const createProduct = async (req, res) => {
  try {
    let imageUrls = [];

    // Handle file uploads if present (from multipart form data)
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }

    // Handle images from JSON body (when no files are uploaded)
    if (req.body.images && Array.isArray(req.body.images)) {
      imageUrls = [...imageUrls, ...req.body.images.filter(img => img && img.trim() !== '')];
    }

    const product = new Product({
      ...req.body,
      images: imageUrls,
    });

    const saved = await product.save();
    const formatted = {
      id: saved._id.toString(),
      name: saved.name,
      price: saved.price,
      category: saved.category,
      images: saved.images,
      isTrending: saved.isTrending,
      isTopProduct: saved.isTopProduct,
      description: saved.description,
      oldPrice: saved.oldPrice || null,
    };

    res.status(201).json({ success: true, product: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// update product
export const updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const formatted = {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      category: product.category,
      images: product.images,
      isTrending: product.isTrending,
      isTopProduct: product.isTopProduct,
      description: product.description,
      oldPrice: product.oldPrice || null,
    };

    res.json({ success: true, product: formatted });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (product.images && Array.isArray(product.images)) {
      for (let url of product.images) {
        if (!url || typeof url !== 'string') continue;

        try {
          const parts = url.split("/");
          if (parts.length < 2) continue;

          let publicId = parts.slice(-2).join("/").split(".")[0];
          if (/^v\d+\//.test(publicId)) {
            publicId = publicId.split("/").slice(1).join("/");
          }

          if (publicId && publicId.trim() !== "") {
            console.log("Deleting from Cloudinary:", publicId);
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (err) {
          console.warn("Failed to delete image from Cloudinary:", url, err.message);
        }
      }
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product & images deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟡 Get Product Statistics (Admin)
export const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const trendingProducts = await Product.countDocuments({ isTrending: true });
    const topProducts = await Product.countDocuments({ isTopProduct: true });

    // Get product counts by category
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get average price
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          averagePrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      }
    ]);

    // Recent products (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProducts = await Product.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        trendingProducts,
        topProducts,
        recentProducts,
        categoryStats,
        priceStats: priceStats[0] || { averagePrice: 0, minPrice: 0, maxPrice: 0 }
      }
    });
  } catch (error) {
    console.error("Get product stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
