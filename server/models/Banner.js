const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    // ======================================================
    // BANNER TITLE
    // ======================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // BANNER SUBTITLE
    // ======================================================

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // BANNER IMAGE
    // ======================================================

    image: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // BUTTON TEXT
    // ======================================================

    buttonText: {
      type: String,
      default: "Shop Now",
      trim: true,
    },

    // ======================================================
    // BUTTON LINK
    // ======================================================

    buttonLink: {
      type: String,
      default: "/products",
      trim: true,
    },

    // ======================================================
    // ACTIVE / INACTIVE
    // ======================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ======================================================
    // DISPLAY ORDER
    // ======================================================

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "banners",
  }
);

// ======================================================
// MODEL
// ======================================================

module.exports = mongoose.model("Banner", bannerSchema);
