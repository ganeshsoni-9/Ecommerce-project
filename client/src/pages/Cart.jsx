import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCart, updateCart, removeCart } from "../services/cartService";
import { setCart } from "../redux/slices/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";
import { ShieldCheck, Truck, ArrowRight, Heart, Trash2 } from "lucide-react";
import { toggleWishlist } from "../services/wishlistService";

export default function Cart() {
  const items = useSelector((state) => state.cart.items || []);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const loadCart = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await getCart();
      dispatch(setCart(response?.data || response || {}));
    } catch (error) {
      console.error("Failed to load cart:", error);
      toast.error("Failed to load cart data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [dispatch, token]);

  const refreshCart = async () => {
    try {
      const response = await getCart();
      dispatch(setCart(response?.data || response || {}));
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    }
  };

  const handleQuantityChange = async (productId, newQuantity, size = "", color = "") => {
    if (newQuantity < 1) return;
    try {
      setUpdatingId(`${productId}-${size}-${color}`);
      await updateCart(productId, newQuantity, size, color);
      await refreshCart();
      toast.success("Cart updated");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update cart");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId, size = "", color = "") => {
    try {
      setUpdatingId(`${productId}-${size}-${color}`);
      await removeCart(productId, size, color);
      await refreshCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMoveToWishlist = async (productId, size = "", color = "") => {
    try {
      setUpdatingId(`${productId}-${size}-${color}`);
      await toggleWishlist(productId);
      await removeCart(productId, size, color);
      await refreshCart();
      toast.success("Moved to wishlist successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to move to wishlist");
    } finally {
      setUpdatingId(null);
    }
  };

  // calculations (server-side calculations are authoritative, but we display estimated calculations here)
  const subtotal = items.reduce((total, item) => {
    const price = Number(item?.product?.price || item?.price || 0);
    const quantity = Number(item?.quantity || 0);
    return total + price * quantity;
  }, 0);

  const discount = appliedCoupon === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.18 * 100) / 100;
  const shippingFee = taxable >= 1000 || taxable === 0 ? 0 : 79;
  const totalAmount = taxable + tax + shippingFee;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "WELCOME10") {
      setAppliedCoupon("WELCOME10");
      toast.success("Coupon code WELCOME10 applied! 10% off simulated.");
    } else if (!couponCode) {
      toast.error("Please enter a coupon code");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container-page py-20 max-w-xl mx-auto text-center">
        <EmptyState
          title="Please login to view your cart"
          text="Access your personalized shopping cart and begin checkout by logging in."
        />
        <div className="mt-8 flex justify-center gap-4">
          <Link className="btn-primary" to="/login">
            Login
          </Link>
          <Link className="btn-light" to="/shop">
            Shop Products
          </Link>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-page py-20 max-w-xl mx-auto text-center">
        <EmptyState
          title="Your cart is empty"
          text="Browse categories, select items and book them instantly."
        />
        <div className="mt-8">
          <Link className="btn-primary" to="/shop">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs">Your Cart</span>
          <h1 className="text-4xl font-black text-slate-900 mt-1">Shopping Cart</h1>
          <p className="text-slate-500 text-sm mt-1.5">Review items, adjust quantities, and proceed to checkout.</p>
        </div>
        <Link to="/shop" className="text-sm font-semibold text-indigo-600 hover:text-indigo-850 transition">
          ← Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid lg:grid-cols-12 gap-8">
        {/* Left Side: Items List */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 px-1">Selected Items ({items.length})</h2>
          
          <div className="space-y-4">
            {items.map((item) => {
              const product = item?.product;
              if (!product) return null;
              const isUpdating = updatingId === `${product._id}-${item.size}-${item.color}`;

              const comparePrice = product.compareAtPrice || product.price;
              const hasDiscount = comparePrice > product.price;

              return (
                <div
                  className="card p-5 flex gap-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition duration-300 relative"
                  key={`${product._id}-${item.size}-${item.color}`}
                >
                  {/* Product Image */}
                  <img
                    src={product.images?.[0] || "https://picsum.photos/seed/product/900/900"}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                    alt={product.name}
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 pr-4">
                    <div>
                      <Link
                        to={`/product/${product._id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 text-lg block truncate"
                      >
                        {product.name}
                      </Link>
                      {product.brand && (
                        <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
                          {product.brand}
                        </p>
                      )}

                      {/* Variant Specs */}
                      {(item.size || item.color) && (
                        <div className="flex gap-3 mt-1.5 flex-wrap">
                          {item.size && (
                            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                      {/* Price Section */}
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-slate-950 text-lg">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{Number(comparePrice).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Quantity Select */}
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          disabled={isUpdating || item.quantity <= 1}
                          onClick={() => handleQuantityChange(product._id, item.quantity - 1, item.size, item.color)}
                          className="px-3 py-1 text-sm font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 text-xs font-bold text-slate-800 border-x border-slate-200 bg-slate-50/50">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isUpdating || item.quantity >= product.stock}
                          onClick={() => handleQuantityChange(product._id, item.quantity + 1, item.size, item.color)}
                          className="px-3 py-1 text-sm font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Trash & Wishlist) */}
                  <div className="absolute top-5 right-5 flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleRemove(product._id, item.size, item.color)}
                      className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-xl transition"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleMoveToWishlist(product._id, item.size, item.color)}
                      className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-xl transition"
                      title="Move to Wishlist"
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-5">
            <h2 className="text-xl font-extrabold text-slate-800 pb-2 border-b border-slate-100">
              Order Summary
            </h2>

            {/* Price Calculations */}
            <div className="space-y-3 text-sm text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900 font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span className="text-slate-900 font-bold">₹{tax.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-green-600">FREE</strong>
                  ) : (
                    <strong className="text-slate-900">₹{shippingFee}</strong>
                  )}
                </span>
              </div>

              <div className="border-t border-slate-200 my-4 pt-4 flex justify-between text-lg text-slate-900 font-extrabold">
                <span>Grand Total</span>
                <span className="text-indigo-600 text-xl">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Apply Coupon
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input flex-1 uppercase font-semibold tracking-wider text-sm text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn-light text-sm font-semibold py-2"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Use WELCOME10 for an instant 10% off simulation</p>
            </div>

            {/* Buttons */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => navigate("/checkout")}
                className="btn-primary w-full py-4 text-center font-bold tracking-wide shadow-lg shadow-indigo-150 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>
              <Link
                to="/shop"
                className="btn-light w-full py-3.5 text-center font-semibold text-sm block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <ShieldCheck size={20} className="text-indigo-600 mx-auto" />
              <p className="font-bold text-xs text-slate-800 mt-1.5">Secure Checkout</p>
              <p className="text-[10px] text-slate-400 mt-0.5">SSL Secured Payment</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <Truck size={20} className="text-indigo-600 mx-auto" />
              <p className="font-bold text-xs text-slate-800 mt-1.5">Fast Shipping</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Reliable Courier Partners</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
