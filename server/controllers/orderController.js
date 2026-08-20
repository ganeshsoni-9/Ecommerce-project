const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Notification = require("../models/Notification");
const { buildOrder } = require("../services/orderService");
const { sendOrderConfirmation } = require("../services/emailService");
const User = require("../models/User");

const statusOrder = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

// ======================================================
// CREATE ORDER
// ======================================================
exports.create = async (req, res, next) => {
  try {
    // Duplicate Order Protection: check if user has placed a similar order in the last 5 seconds
    const recentOrder = await Order.findOne({
      user: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 5000) }
    });
    if (recentOrder) {
      return res.status(429).json({
        success: false,
        message: "Duplicate order request detected. Please wait a moment."
      });
    }

    const { order, coupon } = await buildOrder({
      userId: req.user._id,
      address: req.body.address,
      couponCode: req.body.coupon,
      paymentMethod: req.body.paymentMethod
    });

    // If Cash on Delivery, deduct stock and clear cart immediately
    if (order.paymentMethod === "COD") {
      // Check and deduct stock
      for (const item of order.items) {
        const p = await Product.findById(item.product);
        if (!p || p.stock < item.quantity) {
          // Cleanup order draft if stock check failed
          await Order.findByIdAndDelete(order._id);
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.name}`
          });
        }
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }

      // Clear Cart
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

      // Create initial Notification
      await Notification.create({
        user: req.user._id,
        title: "Order Placed Successfully",
        message: `Your COD order ${order.orderNumber} has been placed.`
      });

      // Send Confirmation Email
      sendOrderConfirmation(req.user, order).catch(err =>
        console.error("Order confirmation email failed:", err)
      );
    }

    res.status(201).json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
};

// ======================================================
// MY ORDERS
// ======================================================
exports.mine = async (req, res, next) => {
  try {
    const o = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.json({ success: true, data: o });
  } catch (e) {
    next(e);
  }
};

// ======================================================
// GET SINGLE ORDER
// ======================================================
exports.get = async (req, res, next) => {
  try {
    const o = await Order.findOne({
      _id: req.params.id,
      user: req.user.role === "CUSTOMER" ? req.user._id : { $exists: true }
    }).populate("user", "name email phone");

    if (!o) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: o });
  } catch (e) {
    next(e);
  }
};

// ======================================================
// ADMIN: LIST ALL ORDERS
// ======================================================
exports.adminList = async (req, res, next) => {
  try {
    const o = await Order.find()
      .populate("user", "name email phone")
      .sort("-createdAt");
    res.json({ success: true, data: o });
  } catch (e) {
    next(e);
  }
};

// ======================================================
// ADMIN: UPDATE STATUS
// ======================================================
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, courierName, estimatedDeliveryDate } = req.body;
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ success: false, message: "Order not found" });

    const currentIdx = statusOrder.indexOf(o.orderStatus);
    const newIdx = statusOrder.indexOf(status);

    if (o.orderStatus === "CANCELLED" || o.orderStatus === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Cannot update status of a cancelled or delivered order"
      });
    }

    if (status === "CANCELLED") {
      o.orderStatus = "CANCELLED";
      o.cancelledAt = new Date();
      o.cancellationReason = req.body.reason || "Cancelled by admin";
      if (o.paymentStatus === "PAID") {
        o.refundStatus = "refund_pending";
      }
      o.trackingHistory.push({
        status: "CANCELLED",
        title: "Order Cancelled",
        description: `Order was cancelled by admin. Reason: ${o.cancellationReason}`
      });

      // Restore stock
      const shouldRestoreStock = o.paymentMethod === "COD" || o.paymentStatus === "PAID";
      if (shouldRestoreStock) {
        for (const item of o.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
      }

      await o.save();

      // Create Notification
      await Notification.create({
        user: o.user,
        title: "Order Cancelled by Admin",
        message: `Your order ${o.orderNumber} has been cancelled by the admin.`
      });

      return res.json({ success: true, data: o });
    }

    if (newIdx === -1) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    if (newIdx < currentIdx) {
      return res.status(400).json({
        success: false,
        message: `Cannot regress order status from ${o.orderStatus} to ${status}`
      });
    }

    o.orderStatus = status;

    let desc = `Your order status has been updated to ${status}.`;
    if (status === "CONFIRMED") {
      desc = "Your order has been confirmed by the seller.";
    } else if (status === "PROCESSING") {
      desc = "Your order is being processed.";
    } else if (status === "PACKED") {
      desc = "Your order has been packed and is ready for shipment.";
    } else if (status === "SHIPPED") {
      if (trackingNumber) o.trackingNumber = trackingNumber;
      if (courierName) o.courierName = courierName;
      if (estimatedDeliveryDate) o.estimatedDeliveryDate = estimatedDeliveryDate;
      desc = `Your order has been shipped via ${o.courierName || "Courier"} (Tracking: ${o.trackingNumber || "N/A"}).`;
    } else if (status === "OUT_FOR_DELIVERY") {
      desc = "Our delivery partner is on the way with your order.";
    } else if (status === "DELIVERED") {
      o.deliveredAt = new Date();
      desc = "Your order has been delivered successfully! Thank you for shopping with us.";
      if (o.paymentMethod === "COD") {
        o.paymentStatus = "PAID";
      }
    }

    o.trackingHistory.push({
      status,
      title: status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " "),
      description: desc
    });

    await o.save();

    // Create Notification
    await Notification.create({
      user: o.user,
      title: `Order Status: ${status}`,
      message: `Your order ${o.orderNumber} status is now ${status}.`
    });

    // Send email notification
    const u = await User.findById(o.user);
    if (u) {
      const { sendEmail } = require("../services/emailService");
      let emailSubject = `Order Update - ${o.orderNumber}`;
      if (status === "SHIPPED") emailSubject = `Your Order Has Been Shipped - ${o.orderNumber}`;
      else if (status === "OUT_FOR_DELIVERY") emailSubject = `Your Order Is Out For Delivery - ${o.orderNumber}`;
      else if (status === "DELIVERED") emailSubject = `Your Order Has Been Delivered - ${o.orderNumber}`;

      sendEmail({
        to: u.email,
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto;">
            <h2 style="color: #4f46e5;">Order Status Update</h2>
            <p>Hello ${u.name},</p>
            <p>Your order <strong>${o.orderNumber}</strong> status has been updated to <strong>${status}</strong>.</p>
            <p>${desc}</p>
            <p>Visit your dashboard to track your order details.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #999;">© CommerceScale. All rights reserved.</p>
          </div>
        `
      }).catch(err => console.error("Email send status failed:", err));
    }

    res.json({ success: true, data: o });
  } catch (e) {
    next(e);
  }
};

// ======================================================
// CANCEL ORDER (USER)
// ======================================================
exports.cancel = async (req, res, next) => {
  try {
    const o = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      orderStatus: { $in: ["PLACED", "CONFIRMED", "PROCESSING"] }
    });

    if (!o) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage"
      });
    }

    o.orderStatus = "CANCELLED";
    o.cancelledAt = new Date();
    o.cancellationReason = req.body.reason || "Cancelled by user";

    if (o.paymentStatus === "PAID") {
      o.refundStatus = "refund_pending";
    }

    o.trackingHistory.push({
      status: "CANCELLED",
      title: "Order Cancelled",
      description: `Order was cancelled. Reason: ${o.cancellationReason}`
    });

    // Restore stock!
    const shouldRestoreStock = o.paymentMethod === "COD" || o.paymentStatus === "PAID";
    if (shouldRestoreStock) {
      for (const item of o.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    await o.save();

    // Create Notification
    await Notification.create({
      user: o.user,
      title: "Order Cancelled",
      message: `Your order ${o.orderNumber} has been successfully cancelled.`
    });

    // Send Cancellation Email
    const u = await User.findById(o.user);
    if (u) {
      const { sendEmail } = require("../services/emailService");
      sendEmail({
        to: u.email,
        subject: `Order Cancelled - ${o.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto;">
            <h2 style="color: #ef4444;">Order Cancelled</h2>
            <p>Hello ${u.name},</p>
            <p>Your order <strong>${o.orderNumber}</strong> has been cancelled.</p>
            <p><strong>Reason:</strong> ${o.cancellationReason}</p>
            ${o.paymentStatus === "PAID" ? "<p>Since this was a paid order, a refund has been initiated and will reflect in your account soon.</p>" : ""}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #999;">© CommerceScale. All rights reserved.</p>
          </div>
        `
      }).catch(err => console.error("Email send cancel failed:", err));
    }

    res.json({ success: true, data: o });
  } catch (e) {
    next(e);
  }
};
