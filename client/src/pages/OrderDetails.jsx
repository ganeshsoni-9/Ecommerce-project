import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrder, cancelOrder } from "../services/orderService";
import { createPayment, verifyPayment } from "../services/paymentService";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";
import { Calendar, MapPin, CreditCard, AlertTriangle, Truck, Info, HelpCircle, ArrowLeft } from "lucide-react";

const STAGES = [
  { status: "PLACED", title: "Placed", desc: "Order successfully placed" },
  { status: "CONFIRMED", title: "Confirmed", desc: "Order confirmed by seller" },
  { status: "PROCESSING", title: "Processing", desc: "Order is being prepared" },
  { status: "PACKED", title: "Packed", desc: "Item packed & ready to ship" },
  { status: "SHIPPED", title: "Shipped", desc: "Item handed over to courier" },
  { status: "OUT_FOR_DELIVERY", title: "Out for Delivery", desc: "Delivery partner is on the way" },
  { status: "DELIVERED", title: "Delivered", desc: "Item successfully delivered" }
];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryingPayment, setRetryingPayment] = useState(false);
  
  // Return/Support workflow
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("Product damaged");
  const [returnDesc, setReturnDesc] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Cancel workflow
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrder(id);
      setOrder(res.data?.data || res.data || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleRetryPayment = async () => {
    if (!order) return;
    try {
      setRetryingPayment(true);
      const payRes = await createPayment({ orderId: order._id });
      const razorOrder = payRes.data.data.razorpayOrder;
      const keyId = payRes.data.data.keyId;

      if (window.Razorpay && razorOrder && keyId) {
        const rz = new window.Razorpay({
          key: keyId,
          amount: razorOrder.amount,
          currency: "INR",
          name: "CommerceScale",
          description: `Payment Retry for Order #${order.orderNumber}`,
          order_id: razorOrder.id,
          handler: async (response) => {
            try {
              await verifyPayment({ orderId: order._id, ...response });
              toast.success("Payment verified successfully!");
              fetchOrder();
            } catch (err) {
              console.error(err);
              toast.error("Signature verification failed.");
            }
          },
          modal: {
            ondismiss: function () {
              setRetryingPayment(false);
              toast.warning("Payment checkout closed.");
            }
          },
          prefill: {
            name: order.shippingAddress?.fullName,
            contact: order.shippingAddress?.phone
          }
        });
        rz.open();
      } else {
        toast.success("Payment simulated successfully.");
        fetchOrder();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Payment retry failed");
    } finally {
      setRetryingPayment(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    const finalReason = cancelReason === "Other" ? customReason : cancelReason;
    try {
      setCancelling(true);
      await cancelOrder(order._id, finalReason);
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      fetchOrder();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReturn(true);
      // Simulate Return Request backend save
      setTimeout(() => {
        toast.success("Return request submitted successfully. Our support team will contact you.");
        setShowReturnModal(false);
        setSubmittingReturn(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Return request failed");
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-black">Order not found</h1>
        <p className="text-slate-500 mt-2">The order you're looking for doesn't exist.</p>
        <Link to="/orders" className="btn-primary mt-6">
          My Orders
        </Link>
      </div>
    );
  }

  // Determine timeline progress indexes
  const currentStatusIdx = STAGES.findIndex(s => s.status === order.orderStatus);
  const isCancelled = order.orderStatus === "CANCELLED";

  return (
    <div className="container-page py-10 bg-slate-50 min-h-screen">
      
      {/* Back button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-650 hover:text-indigo-650 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Timeline and details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Card */}
          <div className="card p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider">Tracking Information</span>
            <div className="flex flex-wrap justify-between items-start gap-4 mt-2">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Order #{order.orderNumber}</h1>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right bg-slate-50 border rounded-2xl p-3">
                <span className="block text-[10px] text-slate-450 uppercase font-bold">Estimated Delivery</span>
                <span className="font-extrabold text-sm text-slate-800">
                  {order.estimatedDeliveryDate
                    ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "Within 3-5 business days"}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Banner */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 text-red-800">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
              <div>
                <strong className="block text-sm font-black text-red-950">This order has been cancelled</strong>
                <p className="text-xs text-red-750 mt-1">
                  Cancelled at: <strong>{order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : "Recently"}</strong>
                </p>
                {order.cancellationReason && (
                  <p className="text-xs text-red-750 mt-0.5">
                    Reason: <strong>{order.cancellationReason}</strong>
                  </p>
                )}
                {order.refundStatus && (
                  <p className="text-xs text-red-750 mt-1">
                    Refund Status: <span className="bg-red-100 border border-red-300 font-black px-1.5 py-0.5 rounded text-[10px] uppercase">{order.refundStatus}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Mismatch Retry Banner */}
          {(order.paymentStatus === "FAILED" || (order.paymentStatus === "PENDING" && order.paymentMethod === "RAZORPAY")) && !isCancelled && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <strong className="block text-sm font-black text-amber-950">Payment Verification Failed/Pending</strong>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your payment was not completed or failed verification. Please retry to keep your order.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRetryPayment}
                disabled={retryingPayment}
                className="btn-primary bg-amber-600 hover:bg-amber-750 font-bold py-2.5 px-5 text-xs text-white"
              >
                {retryingPayment ? "Retrying..." : "Retry Payment Now"}
              </button>
            </div>
          )}

          {/* Tracking Timeline */}
          {!isCancelled && (
            <div className="card p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-800 mb-6 uppercase tracking-wider">Tracking Timeline</h3>
              
              {/* Desktop Horizontal Timeline */}
              <div className="hidden md:flex justify-between relative pb-6">
                <div className="absolute left-4 right-4 top-4 h-1 bg-slate-100 z-0" />
                <div
                  className="absolute left-4 top-4 h-1 bg-green-500 transition-all duration-300 z-0"
                  style={{
                    width: `${currentStatusIdx >= 0 ? (currentStatusIdx / (STAGES.length - 1)) * 96 : 0}%`
                  }}
                />

                {STAGES.map((s, idx) => {
                  const isDone = idx < currentStatusIdx;
                  const isCurrent = idx === currentStatusIdx;
                  return (
                    <div key={s.status} className="flex flex-col items-center flex-1 z-10 text-center relative px-1">
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition duration-300 ${
                          isDone
                            ? "bg-green-500 border-green-500 text-white"
                            : isCurrent
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-150"
                            : "bg-white border-slate-250 text-slate-400"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span className={`text-[11px] font-black mt-2.5 ${isCurrent ? "text-indigo-600 font-extrabold" : isDone ? "text-green-600" : "text-slate-500"}`}>
                        {s.title}
                      </span>
                      <span className="text-[9px] text-slate-400 leading-tight block max-w-[85px] mt-0.5">
                        {order.trackingHistory?.find(x => x.status === s.status)
                          ? new Date(order.trackingHistory.find(x => x.status === s.status).timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                          : s.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="md:hidden space-y-6 relative pl-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {STAGES.map((s, idx) => {
                  const isDone = idx < currentStatusIdx;
                  const isCurrent = idx === currentStatusIdx;
                  
                  return (
                    <div key={s.status} className="relative flex gap-4 items-start">
                      <div
                        className={`absolute -left-6 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 transition ${
                          isDone
                            ? "bg-green-500 border-green-500 text-white"
                            : isCurrent
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-150"
                            : "bg-white border-slate-300 text-slate-400"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <h4 className={`text-xs font-black uppercase tracking-wide ${isCurrent ? "text-indigo-600" : isDone ? "text-green-600" : "text-slate-650"}`}>
                            {s.title}
                          </h4>
                          {order.trackingHistory?.find(x => x.status === s.status) && (
                            <span className="text-[9px] text-slate-400 font-semibold">
                              {new Date(order.trackingHistory.find(x => x.status === s.status).timestamp).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-450 mt-0.5">
                          {order.trackingHistory?.find(x => x.status === s.status)?.description || s.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shipped/Courier details card */}
          {order.trackingNumber && (
            <div className="card p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex items-center gap-3">
              <Truck size={24} className="text-indigo-650 flex-shrink-0" />
              <div className="text-sm text-indigo-950 font-medium">
                Shipped via: <strong className="text-indigo-900 font-extrabold">{order.courierName || "Delhivery"}</strong> · 
                Tracking Number: <strong className="text-indigo-900 font-extrabold">{order.trackingNumber}</strong>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="card p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Ordered Products</h3>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <img
                    src={item.image || "https://picsum.photos/seed/product/900/900"}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-50 border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <div className="flex gap-3 text-xs text-slate-400 mt-1">
                      <span>Price: <strong>₹{item.price}</strong></span>
                      <span>Qty: <strong>{item.quantity}</strong></span>
                      {item.size && <span>Size: <strong>{item.size}</strong></span>}
                      {item.color && <span>Color: <strong>{item.color}</strong></span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Info Columns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Shipping address card */}
          <div className="card p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-850 font-black">
              <MapPin size={18} className="text-indigo-600" />
              Shipping Address
            </div>
            <div className="text-sm text-slate-700 leading-relaxed font-medium">
              <p className="font-extrabold text-slate-950">{order.shippingAddress?.fullName}</p>
              <p className="mt-1">{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p className="font-bold text-slate-500 mt-2 text-xs uppercase tracking-wider">Mobile: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Price Breakdown Panel */}
          <div className="card p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-850 font-black">
              <Info size={18} className="text-indigo-600" />
              Bill Breakdown
            </div>
            <div className="space-y-2.5 text-sm text-slate-650 font-medium">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-900 font-bold">₹{order.subtotal?.toLocaleString("en-IN")}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span className="text-slate-900 font-bold">₹{order.tax?.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-slate-900 font-bold">
                  {order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee}`}
                </span>
              </div>

              <div className="border-t border-slate-200 my-3 pt-3 flex justify-between text-base text-slate-950 font-black">
                <span>Grand Total</span>
                <span className="text-indigo-650 text-lg">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Need Help Action card */}
          <div className="card p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-855 font-black">
              <HelpCircle size={18} className="text-indigo-600" />
              Need Help?
            </div>
            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              <a href="mailto:support@commercescale.com" className="btn-light text-center py-2.5">
                Contact Support
              </a>
              
              {order.orderStatus === "DELIVERED" && (
                <button onClick={() => setShowReturnModal(true)} className="btn-light text-center py-2.5 text-slate-700">
                  Request Return / Refund
                </button>
              )}

              {["PLACED", "CONFIRMED", "PROCESSING"].includes(order.orderStatus) && (
                <button onClick={() => setShowCancelModal(true)} className="btn-light hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-center py-2.5">
                  Cancel Booking
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 bg-white max-w-md w-full rounded-3xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <h2 className="text-lg font-black text-slate-900">Request Return</h2>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="select w-full"
                >
                  <option value="Product damaged">Product damaged / defective</option>
                  <option value="Wrong size/color">Wrong size / color received</option>
                  <option value="Not as described">Product not as described</option>
                  <option value="Quality issue">Quality mismatch</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Additional description</label>
                <textarea
                  rows={3}
                  className="input w-full text-slate-800"
                  placeholder="Detail the issue..."
                  value={returnDesc}
                  onChange={(e) => setReturnDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="btn-primary flex-1 py-3 text-xs font-bold disabled:opacity-50"
                >
                  {submittingReturn ? "Submitting..." : "Submit Return Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="btn-light flex-1 py-3 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 bg-white max-w-md w-full rounded-3xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={22} />
              <h2 className="text-lg font-black text-slate-900">Cancel Order</h2>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Are you sure you want to cancel this order? Paid payments will be marked for refund.
            </p>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Select Reason
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="select w-full"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                  <option value="Delivery taking too long">Delivery taking too long</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {cancelReason === "Other" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Specify Reason *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe why..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="input w-full"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={cancelling}
                  className="btn-primary bg-red-600 hover:bg-red-750 flex-1 py-3 text-center text-xs font-bold disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="btn-light flex-1 py-3 text-center text-xs font-semibold"
                >
                  Keep Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
