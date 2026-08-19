const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Review = require("../models/Review");

exports.users = async (req, res, next) => {
  try {
    const data = await User.find().select("-password").sort("-createdAt");
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

exports.setUserRole = async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select("-password");
    res.json({ success: true, data: u });
  } catch (e) {
    next(e);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};

exports.dashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      activeUsers,
      blockedUsers,
      products,
      orders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      categories,
      reviews,
      rev
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isVerified: false }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ["PENDING", "PROCESSING", "CONFIRMED", "SHIPPED"] } }),
      Order.countDocuments({ orderStatus: "DELIVERED" }),
      Order.countDocuments({ orderStatus: "CANCELLED" }),
      Category.countDocuments(),
      Review.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        activeUsers,
        blockedUsers,
        products,
        orders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        categories,
        reviews,
        revenue: rev[0]?.total || 0
      }
    });
  } catch (e) {
    next(e);
  }
};
