import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1,
      },
      image: String,
      size: {
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL'],
        required: true
      }
    },
  ],
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;

