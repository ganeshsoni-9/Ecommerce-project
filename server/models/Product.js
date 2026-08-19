const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sizes: [
      {
        type: String,
        trim: true,
      },
    ],

    colors: [
      {
        type: String,
        trim: true,
      },
    ],

    variants: [
      {
        color: {
          type: String,
          trim: true,
        },
        stock: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    specifications: {
      material: {
        type: String,
        default: "",
      },
      warranty: {
        type: String,
        default: "",
      },
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

module.exports = mongoose.model("Product", productSchema);
