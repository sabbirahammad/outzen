import mongoose from "mongoose";

const paymentProofSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  transaction_id: {
    type: String,
    required: [true, "Transaction ID is required"],
    trim: true,
  },
  payment_method: {
    type: String,
    required: [true, "Payment method is required"],
    enum: ["bkash", "nagad", "rocket", "bank"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0, "Amount must be positive"],
  },
  screenshot: {
    type: String,
    required: [true, "Payment screenshot is required"],
    // This will store base64 image data
  },
  sender_number: {
    type: String,
    required: [true, "Sender number is required"],
    trim: true,
  },
  sender_name: {
    type: String,
    required: [true, "Sender name is required"],
    trim: true,
  },
  payment_date: {
    type: Date,
    required: [true, "Payment date is required"],
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  verified_at: {
    type: Date,
  },
  admin_notes: {
    type: String,
    trim: true,
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for efficient queries
paymentProofSchema.index({ order: 1, user: 1 });
paymentProofSchema.index({ status: 1, submitted_at: -1 });

const PaymentProof = mongoose.model("PaymentProof", paymentProofSchema);

export default PaymentProof;