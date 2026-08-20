const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Notification = require("../models/Notification");
const { createGatewayOrder, verify } = require("../services/paymentService");
const { sendOrderConfirmation } = require("../services/emailService");
const User = require("../models/User");

exports.create = async (req, res, next) => {
  try {
    const o = await Order.findOne({ _id: req.body.orderId, user: req.user._id });
    if (!o) return res.status(404).json({ success: false, message: "Order not found" });

    const gateway = await createGatewayOrder({ amount: o.totalAmount, receipt: o.orderNumber });

    // Link Razorpay order ID to the order
    o.razorpayOrderId = gateway.id;
    await o.save();

    // Create payment in DB with correct schema fields
    const p = await Payment.create({
      order: o._id,
      user: req.user._id,
      transactionId: gateway.id,
      paymentMethod: "online",
      amount: o.totalAmount,
      status: "pending",
      paymentGateway: "razorpay"
    });

    res.json({
      success: true,
      data: {
        paymentId: p._id,
        order: o,
        razorpayOrder: gateway,
        keyId: process.env.RAZORPAY_KEY_ID || null
      }
    });
  } catch (e) {
    next(e);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const ok = verify({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    // Update payment record in DB using schema properties
    const p = await Payment.findOneAndUpdate(
      { order: orderId },
      {
        transactionId: razorpay_payment_id,
        status: ok ? "success" : "failed",
        paidAt: ok ? new Date() : null
      },
      { new: true }
    );

    const o = await Order.findById(orderId);
    if (!o) return res.status(404).json({ success: false, message: "Order not found" });

    if (ok) {
      // Check stock availability
      for (const item of o.items) {
        const prod = await Product.findById(item.product);
        if (!prod || prod.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.name}`
          });
        }
      }

      // Deduct stock
      for (const item of o.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }

      // Update Order Status
      o.paymentStatus = "PAID";
      o.orderStatus = "PLACED";
      o.razorpayPaymentId = razorpay_payment_id;
      o.razorpaySignature = razorpay_signature;

      // Add to tracking history if not already present
      if (!o.trackingHistory.some(x => x.status === "PLACED")) {
        o.trackingHistory.push({
          status: "PLACED",
          title: "Order Placed",
          description: "Your order has been placed successfully and payment verified."
        });
      }
      await o.save();

      // Clear the Cart
      await Cart.findOneAndUpdate({ user: o.user }, { items: [] });

      // Create Notification
      await Notification.create({
        user: o.user,
        title: "Order Placed & Paid",
        message: `Your order ${o.orderNumber} has been verified and placed successfully.`
      });

      // Send Email Confirmation
      const u = await User.findById(o.user);
      if (u) {
        sendOrderConfirmation(u, o).catch(err => console.error("Order confirmation email failed:", err));
      }

      res.json({ success: true, data: p });
    } else {
      o.paymentStatus = "FAILED";
      await o.save();
      return res.status(400).json({ success: false, message: "Payment signature verification failed" });
    }
  } catch (e) {
    next(e);
  }
};
