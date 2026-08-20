const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const generateOrderNumber = require("../utils/generateOrderNumber");

exports.buildOrder = async ({ userId, address, couponCode, paymentMethod }) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || !cart.items.length) {
    throw Object.assign(new Error("Cart is empty"), { statusCode: 400 });
  }

  let subtotal = 0;
  const items = [];

  for (const i of cart.items) {
    if (!i.product || !i.product.isActive) {
      throw Object.assign(new Error("A product is unavailable"), { statusCode: 400 });
    }
    if (i.product.stock < i.quantity) {
      throw Object.assign(new Error(`Insufficient stock for ${i.product.name}`), { statusCode: 400 });
    }

    subtotal += i.product.price * i.quantity;

    items.push({
      product: i.product._id,
      name: i.product.name,
      image: i.product.images?.[0] || "",
      price: i.product.price, // Snapshotted price from active DB
      quantity: i.quantity,
      sku: i.product.sku || "",
      size: i.size || "",
      color: i.color || ""
    });
  }

  let discount = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (
      !coupon ||
      (coupon.expiryDate && coupon.expiryDate < new Date()) ||
      coupon.minimumOrderAmount > subtotal
    ) {
      throw Object.assign(new Error("Invalid coupon"), { statusCode: 400 });
    }

    discount =
      coupon.discountType === "percentage"
        ? (subtotal * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maximumDiscount) {
      discount = Math.min(discount, coupon.maximumDiscount);
    }
    discount = Math.min(discount, subtotal);
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.18 * 100) / 100;
  const shipping = taxable >= 1000 ? 0 : 79;
  const total = taxable + tax + shipping;

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const initialTrackingHistory = [];
  if (paymentMethod === "COD") {
    initialTrackingHistory.push({
      status: "PLACED",
      title: "Order Placed",
      description: "Your order has been placed successfully and will be delivered soon."
    });
  }

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: userId,
    items,
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      address: address.address || address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country || "India"
    },
    subtotal,
    discount,
    tax,
    shippingFee: shipping,
    shippingCharge: shipping,
    totalAmount: total,
    couponCode: couponCode || "",
    paymentMethod: paymentMethod || "COD",
    orderStatus: "PLACED",
    paymentStatus: "PENDING",
    estimatedDeliveryDate: estimatedDelivery,
    trackingHistory: initialTrackingHistory
  });

  return { order, coupon };
};
