import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCart, updateCart, removeCart, clearCart as clearCartApi } from "../services/cartService";
import { setCart, clearCart } from "../redux/slices/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";
import { ShieldCheck, Truck, CreditCard, Gift, Phone, Mail, User, MapPin } from "lucide-react";
import { sendOtp, verifyOtp } from "../services/authService";
import { setAuth } from "../redux/slices/authSlice";
import { createOrder } from "../services/orderService";
import { createPayment, verifyPayment } from "../services/paymentService";

export default function Cart() {
  const items = useSelector((state) => state.cart.items || []);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Checkout Shipping Form
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "Rajasthan",
    pincode: "",
    country: "India"
  });

  // Payment choice
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD or RAZORPAY
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0); // simulation or actual
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Guest OTP login on cart
  const [otpStep, setOtpStep] = useState(1); // 1: input details, 2: verify otp
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestOtp, setGuestOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  // ==========================================
  // LOAD CART IF LOGGED IN
  // ==========================================
  const loadCart = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await getCart();
      const cartData = response?.data || response || {};
      dispatch(setCart(cartData));
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

  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  // ==========================================
  // REFRESH CART
  // ==========================================
  const refreshCart = async () => {
    try {
      const response = await getCart();
      const cartData = response?.data || response || {};
      dispatch(setCart(cartData));
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    }
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================
  const handleQuantityChange = async (productId, quantity) => {
    const newQuantity = Number(quantity);
    if (!newQuantity || newQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      setUpdatingId(productId);
      await updateCart(productId, { quantity: newQuantity });
      await refreshCart();
      toast.success("Cart updated");
    } catch (error) {
      console.error("Failed to update cart:", error);
      toast.error(error?.response?.data?.message || "Failed to update cart");
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================
  const handleRemove = async (productId) => {
    try {
      setUpdatingId(productId);
      await removeCart(productId);
      await refreshCart();
      toast.success("Product removed from cart");
    } catch (error) {
      console.error("Failed to remove product:", error);
      toast.error("Failed to remove product");
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // CALCULATIONS (perfectly matching backend)
  // ==========================================
  const subtotal = items.reduce((total, item) => {
    const price = Number(item?.product?.price || 0);
    const quantity = Number(item?.quantity || 0);
    return total + price * quantity;
  }, 0);

  // Simulate coupon discount (e.g. WELCOME10 for 10%)
  const discount = couponCode.toUpperCase() === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.18 * 100) / 100;
  const shippingFee = taxable >= 1000 ? 0 : 79;
  const totalAmount = taxable + tax + shippingFee;

  // ==========================================
  // GUEST OTP VERIFICATION
  // ==========================================
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!guestEmail) return;
    try {
      setLoading(true);
      const res = await sendOtp({ email: guestEmail, phone: guestPhone, name: guestName });
      if (res.data.success) {
        toast.success("OTP sent to your email & phone!");
        setOtpStep(2);
        setOtpSent(true);
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!guestOtp) return;
    try {
      setLoading(true);
      const res = await verifyOtp({ email: guestEmail, otp: guestOtp });
      if (res.data.success) {
        toast.success("Welcome! You are now verified.");
        dispatch(setAuth(res.data.data));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PLACE ORDER & PAY
  // ==========================================
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!address.fullName || !address.phone || !address.address || !address.city || !address.pincode) {
      toast.error("Please fill in all shipping details");
      return;
    }

    try {
      setIsSubmittingOrder(true);
      
      // 1. Create order on the backend
      const res = await createOrder({
        address,
        coupon: couponCode,
        paymentMethod
      });
      const order = res.data.data;

      // 2. Handle Razorpay Payment flow
      if (paymentMethod === "RAZORPAY") {
        const payRes = await createPayment({ orderId: order._id });
        const razorOrder = payRes.data.data.razorpayOrder;
        const keyId = payRes.data.data.keyId;

        if (window.Razorpay && razorOrder && keyId) {
          const rz = new window.Razorpay({
            key: keyId,
            amount: razorOrder.amount,
            currency: "INR",
            name: "CommerceScale",
            order_id: razorOrder.id,
            handler: async (response) => {
              try {
                await verifyPayment({ orderId: order._id, ...response });
                dispatch(clearCart());
                await clearCartApi();
                toast.success("Payment verified! Booking complete.");
                navigate(`/order-success?order=${order._id}`);
              } catch (err) {
                toast.error("Payment verification failed.");
              }
            },
            modal: {
              ondismiss: function () {
                setIsSubmittingOrder(false);
              }
            }
          });
          rz.open();
        } else {
          toast.success("Order placed. Configure Razorpay for live checkout.");
          dispatch(clearCart());
          await clearCartApi();
          navigate(`/order-success?order=${order._id}`);
        }
      } 
      
      // 3. Handle Cash on Delivery (COD) flow
      else {
        toast.success("Booking placed successfully with COD!");
        dispatch(clearCart());
        await clearCartApi();
        navigate(`/order-success?order=${order._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to book items");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  // ==========================================
  // NOT LOGGED IN / GUEST SCREEN
  // ==========================================
  if (!token) {
    return (
      <div className="container-page py-16 max-w-lg mx-auto">
        <div className="card p-8 border border-slate-200/80 shadow-xl rounded-3xl bg-white relative">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Checkout Verification</h1>
            <p className="text-slate-500 text-sm mt-2">
              Verify your Gmail & SMS via OTP to access your cart, calculate prices, and complete your booking.
            </p>
          </div>

          {devOtp && otpStep === 2 && (
            <div className="mb-5 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center text-xs text-indigo-700">
              <span className="font-bold">Dev Helper:</span> Verification OTP is <span className="font-mono font-black text-sm bg-indigo-200 px-2 py-0.5 rounded text-indigo-900 tracking-wider">{devOtp}</span>
            </div>
          )}

          {otpStep === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-400" size={17} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="input w-full text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Gmail Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={17} />
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="input w-full text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Phone (for SMS)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 text-slate-400" size={17} />
                  <input
                    type="tel"
                    required
                    placeholder="Enter phone number"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="input w-full text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-3.5 font-bold mt-6 shadow-indigo-200 shadow-lg hover:shadow-indigo-300"
              >
                Send OTP Verification
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider text-center">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={guestOtp}
                  onChange={(e) => setGuestOtp(e.target.value.replace(/\D/g, ''))}
                  className="input text-center text-2xl font-bold tracking-[8px] py-3.5 max-w-[200px] mx-auto block"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-3.5 font-bold"
              >
                Verify & Load Cart
              </button>

              <button 
                type="button" 
                onClick={() => setOtpStep(1)} 
                className="text-slate-500 hover:text-indigo-600 font-semibold text-sm text-center w-full block mt-3"
              >
                ← Back to enter details
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // EMPTY CART
  // ==========================================
  if (!items.length) {
    return (
      <div className="container-page py-16 max-w-xl mx-auto">
        <EmptyState
          title="Your cart is empty"
          text="Browse categories, select items and book them instantly."
        />
        <div className="text-center mt-6">
          <Link className="btn-primary" to="/shop">
            Explore products
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // UNIFIED CART & CHECKOUT PAGE
  // ==========================================
  return (
    <div className="container-page py-10 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs">Single-Page Checkout</span>
          <h1 className="text-4xl font-black text-slate-900 mt-1">Book Your Collection</h1>
          <p className="text-slate-500 text-sm mt-1.5">Review items, verify pricing and complete booking instantly.</p>
        </div>
        <Link to="/shop" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
          ← Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cart Items (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 px-1">Selected Items ({items.length})</h2>
          
          <div className="space-y-3">
            {items.map((item) => {
              const product = item?.product;
              if (!product) return null;
              const isUpdating = updatingId === product._id;

              return (
                <div
                  className="card p-4 flex gap-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition duration-300 relative"
                  key={product._id}
                >
                  {/* Product Image */}
                  <img
                    src={product.images?.[0] || "https://picsum.photos/seed/product/900/900"}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                    alt={product.name}
                  />

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link
                        to={`/product/${product._id}`}
                        className="font-bold text-slate-800 hover:text-indigo-600 text-base block truncate"
                      >
                        {product.name}
                      </Link>
                      {product.brand && (
                        <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
                          {product.brand}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <span className="font-extrabold text-slate-900 text-base">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-semibold">Qty:</span>
                        <input
                          className="input !py-1 !px-2 !w-14 text-center text-sm font-bold border-slate-200 text-slate-850"
                          type="number"
                          min="1"
                          max={product.stock}
                          value={item.quantity}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleQuantityChange(product._id, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    disabled={isUpdating}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition disabled:opacity-50 text-sm font-semibold"
                    onClick={() => handleRemove(product._id)}
                    title="Remove item"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Unified Checkout & Booking Form (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Checkout Info Form Card */}
          <form onSubmit={handlePlaceOrder} className="card p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-5">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="text-indigo-600" size={20} />
              Shipping Address
            </h2>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={address.fullName}
                  onChange={(e) => setAddress({...address, fullName: e.target.value})}
                  className="input w-full text-slate-800 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Contact Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={address.phone}
                  onChange={(e) => setAddress({...address, phone: e.target.value})}
                  className="input w-full text-slate-800 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Flat, House no., Building, Company, Apartment, Street"
                  value={address.address}
                  onChange={(e) => setAddress({...address, address: e.target.value})}
                  className="input w-full text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="input w-full text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    className="input w-full text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Postal / Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit pincode"
                    value={address.pincode}
                    onChange={(e) => setAddress({...address, pincode: e.target.value})}
                    className="input w-full text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    required
                    placeholder="Country"
                    value={address.country}
                    onChange={(e) => setAddress({...address, country: e.target.value})}
                    className="input w-full text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex flex-col items-center justify-center p-3.5 border-2 rounded-xl transition ${paymentMethod === "COD" ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}
                >
                  <Truck size={20} className="mb-1.5" />
                  <span className="text-sm">Cash on Delivery</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`flex flex-col items-center justify-center p-3.5 border-2 rounded-xl transition ${paymentMethod === "RAZORPAY" ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}
                >
                  <CreditCard size={20} className="mb-1.5" />
                  <span className="text-sm">Pay Online (Razorpay)</span>
                </button>
              </div>
            </div>

            {/* Coupon / Promos */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Gift size={15} /> Apply Coupon
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
                  onClick={() => {
                    if (couponCode.toUpperCase() === "WELCOME10") {
                      toast.success("Coupon code applied successfully! 10% discount subtracted.");
                    } else if (!couponCode) {
                      toast.error("Please enter a code");
                    } else {
                      toast.error("Invalid coupon code");
                    }
                  }}
                  className="btn-light text-sm font-semibold"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Use WELCOME10 for an instant 10% off simulation</p>
            </div>

            {/* Subtotal, tax, and order booking final calculations */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span>{shippingFee === 0 ? <strong className="text-green-600">FREE</strong> : `₹${shippingFee}`}</span>
              </div>

              <div className="border-t border-slate-200 my-3 pt-3 flex justify-between text-lg text-slate-900 font-extrabold">
                <span>Total Booking Price</span>
                <span className="text-indigo-600">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingOrder}
              className="btn-primary w-full py-4 text-center font-bold tracking-wide mt-2 shadow-lg shadow-indigo-150 disabled:opacity-50"
            >
              {isSubmittingOrder ? "Processing Booking..." : paymentMethod === "RAZORPAY" ? "Book & Pay Now" : "Confirm Booking (COD)"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
