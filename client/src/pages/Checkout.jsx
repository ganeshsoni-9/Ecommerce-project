import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createOrder } from "../services/orderService";
import { createPayment, verifyPayment } from "../services/paymentService";
import { getCart, clearCart as clearCartApi } from "../services/cartService";
import { setCart, clearCart } from "../redux/slices/cartSlice";
import { getAddresses, createAddress } from "../services/addressService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { MapPin, Plus, Check, ShieldCheck, CreditCard, Truck } from "lucide-react";

export default function Checkout() {
  const items = useSelector((state) => state.cart.items || []);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Address, 2: Review, 3: Payment
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    addressLine: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    saveAddress: true
  });

  // Coupon / calculations
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD or RAZORPAY
  
  const loadAddressData = async () => {
    try {
      setLoading(true);
      const res = await getAddresses();
      const addrList = res.data || [];
      setAddresses(addrList);
      
      const defaultAddr = addrList.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0]._id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load saved addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadAddressData();
  }, [token]);

  // secure Calculations
  const subtotal = items.reduce((total, item) => {
    const price = Number(item?.product?.price || item?.price || 0);
    const quantity = Number(item?.quantity || 0);
    return total + price * quantity;
  }, 0);

  const discount = couponCode.toUpperCase() === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.18 * 100) / 100;
  const shippingFee = taxable >= 1000 || taxable === 0 ? 0 : 79;
  const totalAmount = taxable + tax + shippingFee;

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    // Validate inputs
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (newAddress.phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (newAddress.pincode.length < 6) {
      toast.error("Please enter a valid pincode");
      return;
    }

    try {
      setLoading(true);
      const res = await createAddress({
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        addressLine: newAddress.addressLine,
        landmark: newAddress.landmark,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        country: newAddress.country,
        isDefault: addresses.length === 0
      });
      toast.success("Address saved successfully");
      const savedAddr = res.data;
      setAddresses(prev => [savedAddr, ...prev]);
      setSelectedAddressId(savedAddr._id);
      setShowNewAddressForm(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAddressDetails = () => {
    return addresses.find(a => a._id === selectedAddressId);
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    const shippingDetails = getSelectedAddressDetails();

    try {
      setIsSubmitting(true);
      
      const orderPayload = {
        address: {
          fullName: shippingDetails.fullName,
          phone: shippingDetails.phone,
          address: shippingDetails.addressLine + (shippingDetails.landmark ? `, ${shippingDetails.landmark}` : ""),
          city: shippingDetails.city,
          state: shippingDetails.state,
          pincode: shippingDetails.pincode,
          country: shippingDetails.country
        },
        coupon: couponCode,
        paymentMethod
      };

      const res = await createOrder(orderPayload);
      const order = res.data.data;

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
            description: `Payment for Order #${order.orderNumber}`,
            order_id: razorOrder.id,
            handler: async (response) => {
              try {
                await verifyPayment({ orderId: order._id, ...response });
                dispatch(clearCart());
                await clearCartApi();
                toast.success("Payment verified successfully!");
                navigate(`/order-success/${order._id}`);
              } catch (err) {
                console.error(err);
                toast.error("Payment verification failed. Please try again.");
                navigate(`/orders/${order._id}`);
              }
            },
            modal: {
              ondismiss: function () {
                setIsSubmitting(false);
                toast.warning("Payment cancelled. You can retry paying from your orders page.");
                navigate(`/orders/${order._id}`);
              }
            },
            prefill: {
              name: shippingDetails.fullName,
              contact: shippingDetails.phone,
              email: user?.email || ""
            }
          });
          rz.open();
        } else {
          // Mock payment verification fallback if keys are missing
          toast.success("Order placed (Simulation mode).");
          dispatch(clearCart());
          await clearCartApi();
          navigate(`/order-success/${order._id}`);
        }
      } else {
        toast.success("COD Order placed successfully!");
        dispatch(clearCart());
        await clearCartApi();
        navigate(`/order-success/${order._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  if (loading && addresses.length === 0) {
    return (
      <div className="container-page py-20 flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 max-w-xl mx-auto text-center">
        <EmptyState title="Your cart is empty" text="Add items to cart before checking out." />
        <button onClick={() => navigate("/shop")} className="btn-primary mt-8">
          Shop Products
        </button>
      </div>
    );
  }

  return (
    <div className="container-page py-10 bg-slate-50 min-h-screen">
      {/* Step Progress Bar */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-300 z-0"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                step >= 1 ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-500"
              }`}
            >
              {step > 1 ? <Check size={18} /> : "1"}
            </div>
            <span className="text-xs font-bold text-slate-600 mt-2 bg-slate-50 px-2">Address</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                step >= 2 ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-500"
              }`}
            >
              {step > 2 ? <Check size={18} /> : "2"}
            </div>
            <span className="text-xs font-bold text-slate-600 mt-2 bg-slate-50 px-2">Review</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                step === 3 ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-500"
              }`}
            >
              "3"
            </div>
            <span className="text-xs font-bold text-slate-600 mt-2 bg-slate-50 px-2">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mt-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          
          {/* STEP 1: SELECT OR ADD ADDRESS */}
          {step === 1 && (
            <div className="card p-6 bg-white border border-slate-200 rounded-2xl space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <MapPin size={22} className="text-indigo-600" />
                  Select Delivery Address
                </h2>
                {!showNewAddressForm && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-850 flex items-center gap-1 border border-indigo-100 px-3 py-1.5 rounded-xl bg-indigo-50/30"
                  >
                    <Plus size={14} /> Add Address
                  </button>
                )}
              </div>

              {showNewAddressForm ? (
                <form onSubmit={handleAddNewAddress} className="space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800">Add New Shipping Address</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="e.g. John Doe"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Contact Number *</label>
                      <input
                        type="tel"
                        required
                        className="input"
                        placeholder="10-digit mobile number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Address line *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="Flat, building name, street address"
                      value={newAddress.addressLine}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Landmark</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Near mall"
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="6-digit pincode"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Country</label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-2">
                    <button type="submit" className="btn-primary py-3 px-6">
                      Save & Deliver Here
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="btn-light py-3 px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 border-2 rounded-2xl cursor-pointer transition flex items-start gap-3 ${
                        selectedAddressId === addr._id
                          ? "border-indigo-600 bg-indigo-50/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddressId === addr._id ? "border-indigo-600 bg-indigo-600" : "border-slate-350"
                          }`}
                        >
                          {selectedAddressId === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="bg-slate-100 text-[10px] text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase border">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{addr.addressLine}</p>
                        {addr.landmark && <p className="text-xs text-slate-400">Landmark: {addr.landmark}</p>}
                        <p className="text-sm text-slate-600">
                          {addr.city}, {addr.state} - <span className="font-semibold">{addr.pincode}</span>
                        </p>
                        <p className="text-xs font-bold text-slate-500 mt-2">Mobile: {addr.phone}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedAddressId}
                      className="btn-primary py-3.5 px-8 disabled:opacity-50"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: REVIEW ORDER */}
          {step === 2 && (
            <div className="card p-6 bg-white border border-slate-200 rounded-2xl space-y-6">
              <h2 className="text-xl font-black text-slate-900 pb-3 border-b border-slate-100">
                Review Your Order
              </h2>

              {/* Delivery Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Delivery Address</h3>
                {(() => {
                  const addr = getSelectedAddressDetails();
                  return addr ? (
                    <div className="mt-2 text-sm text-slate-600">
                      <p className="font-bold text-slate-900">{addr.fullName}</p>
                      <p>{addr.addressLine}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="font-semibold text-slate-500 mt-1.5">Phone: {addr.phone}</p>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800">Items Ordered</h3>
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={`${item.product._id}-${item.size}-${item.color}`} className="py-3 flex justify-between gap-4">
                      <div className="flex gap-3">
                        <img
                          src={item.product.images?.[0] || "https://picsum.photos/seed/product/900/900"}
                          className="w-14 h-14 rounded-lg object-cover bg-slate-50 border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-sm text-slate-800">{item.product.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Qty: <strong className="text-slate-650">{item.quantity}</strong>
                            {item.size && ` · Size: ${item.size}`}
                            {item.color && ` · Color: ${item.color}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 text-sm">
                          ₹{Number((item.product.price || item.price) * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStep(1)} className="btn-light py-3 px-6">
                  Back to Address
                </button>
                <button onClick={() => setStep(3)} className="btn-primary py-3.5 px-8">
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="card p-6 bg-white border border-slate-200 rounded-2xl space-y-6">
              <h2 className="text-xl font-black text-slate-900 pb-3 border-b border-slate-100">
                Select Payment Method
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-5 border-2 rounded-2xl cursor-pointer transition flex gap-3 ${
                    paymentMethod === "COD" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "COD" ? "border-indigo-600 bg-indigo-600" : "border-slate-350"
                      }`}
                    >
                      {paymentMethod === "COD" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-extrabold text-slate-900">
                      <Truck size={18} className="text-indigo-650" />
                      Cash on Delivery (COD)
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Pay with cash upon delivery of your products.</p>
                  </div>
                </div>

                {/* Online Payment */}
                <div
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`p-5 border-2 rounded-2xl cursor-pointer transition flex gap-3 ${
                    paymentMethod === "RAZORPAY" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "RAZORPAY" ? "border-indigo-600 bg-indigo-600" : "border-slate-350"
                      }`}
                    >
                      {paymentMethod === "RAZORPAY" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-extrabold text-slate-900">
                      <CreditCard size={18} className="text-indigo-650" />
                      Pay Online (Razorpay)
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Pay instantly and securely using credit cards, UPI, or NetBanking.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={() => setStep(2)} className="btn-light py-3 px-6">
                  Back to Review
                </button>
                
                <button
                  onClick={submitOrder}
                  disabled={isSubmitting}
                  className="btn-primary py-4 px-10 text-center font-bold tracking-wide shadow-lg shadow-indigo-150 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Placing Your Order..."
                  ) : paymentMethod === "RAZORPAY" ? (
                    <>
                      Book & Pay Online
                      <ShieldCheck size={16} />
                    </>
                  ) : (
                    "Place COD Order"
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 bg-white border border-slate-200 rounded-2xl space-y-5">
            <h3 className="text-lg font-black text-slate-800 pb-2 border-b border-slate-100">
              Payment Breakdown
            </h3>
            
            <div className="space-y-2.5 text-sm text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
              </div>

              <div className="border-t border-slate-200 my-3 pt-3 flex justify-between text-base text-slate-900 font-black">
                <span>Total Amount</span>
                <span className="text-indigo-650">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="bg-slate-50 border rounded-xl p-3.5 text-center text-xs text-slate-500">
              Estimated Delivery: <strong>{estimatedDelivery.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
