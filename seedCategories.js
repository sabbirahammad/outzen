import Category from "./models/categoryModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected for seeding"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

// Seed data
const seedCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log("🗑️  Existing categories cleared");

    // Create MEN category with the provided structure
    const menCategory = new Category({
      title: "MEN",
      items: [
        "Men",
        "Full Sleeve T-shirt",
        "Drop Shoulder T-shirt",
        "Sports T-shirt",
        "Polo T-shirt",
        "Shirt",
        "Underwear",
        "Panjabi",
        "Denim Jeans",
        "Comfy Trouser",
        "Sports Trouser",
        "Joggers",
        "Jacket",
        "Shorts",
        "sexy girl"
      ],
      id: "64a6",
      image: ""
    });

    await menCategory.save();
    console.log("✅ MEN category seeded successfully");

    console.log("🎉 Categories seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
};

// Run the seed function
seedCategories();