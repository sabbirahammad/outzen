import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce_products", // Cloudinary তে ফোল্ডারের নাম
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // only image format
  },
});

const upload = multer({ storage });

export default upload;


