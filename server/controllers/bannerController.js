const Banner = require("../models/Banner");

// ======================================================
// GET ALL ACTIVE BANNERS
// GET /api/banners
// ======================================================

exports.list = async (req, res, next) => {
  try {
    const banners = await Banner.find({
      isActive: true,
    }).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET SINGLE BANNER
// GET /api/banners/:id
// ======================================================

exports.getById = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// CREATE BANNER
// POST /api/banners
// ADMIN ONLY
// ======================================================

exports.create = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      image,
      buttonText,
      buttonLink,
      isActive,
      order,
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: "Title and image are required",
      });
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || "",
      image,
      buttonText: buttonText || "Shop Now",
      buttonLink: buttonLink || "/products",
      isActive: isActive !== undefined ? isActive : true,
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE BANNER
// PUT /api/banners/:id
// ADMIN ONLY
// ======================================================

exports.update = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// DELETE / DEACTIVATE BANNER
// DELETE /api/banners/:id
// ADMIN ONLY
// ======================================================

exports.remove = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({
      success: true,
      message: "Banner deactivated successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};
