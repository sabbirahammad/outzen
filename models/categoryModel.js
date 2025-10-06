import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    // For navbar structure
    title: { type: String, default: "" },
    items: [{ type: String, default: "" }],

    // For admin structure
    name: { type: String, default: "" },

    // Common fields
    id: { type: String, required: true, unique: true },
    image: { type: String, default: "" },

    // For subcategories (if needed)
    category_id: { type: String, default: "" },
    sub_category_id: { type: Number, default: null },
  },
  { timestamps: true }
);

// Add validation to ensure either name or title is provided
categorySchema.pre('validate', function(next) {
  if (!this.name && !this.title) {
    this.name = this.name || "";
  }
  next();
});

// Virtual for backward compatibility
categorySchema.virtual('displayName').get(function() {
  return this.name || this.title || "";
});

categorySchema.set('toJSON', { virtuals: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;