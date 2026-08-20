import { useEffect, useState } from "react";
import { myOrders, cancelOrder } from "../services/orderService";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";
import { Calendar, Tag, AlertTriangle, XCircle, ArrowRight } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await myOrders();
      setOrders(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    const finalReason = cancelReason === "Other" ? customReason : cancelReason;
    if (!finalReason) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      setCancelling(true);
      await cancelOrder(selectedOrderId, finalReason);
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
      case "CONFIRMED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "PLACED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const isCancellable = (status) => {
    return ["PLACED", "CONFIRMED", "PROCESSING"].includes(status);
  };

  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container-page py-10 bg-slate-50 min-h-screen">
      <div className="border-b border-slate-200 pb-5">
        <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs">Customer Profile</span>
        <h1 className="text-4xl font-black text-slate-900 mt-1">My Orders</h1>
        <p className="text-slate-500 text-sm mt-1.5">Track shipment states, download bills, or manage cancellations.</p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-10 mt-8 text-center max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800">No orders found</h2>
          <p className="text-slate-500 mt-2">You haven't placed any bookings yet.</p>
          <Link className="btn-primary mt-6" to="/shop">
            Shop Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="card bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition duration-300"
            >
              {/* Header Info Banner */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Order Placed</span>
                    <span className="text-slate-800">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Order Number</span>
                    <span className="text-slate-800">{order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Payment Method</span>
                    <span className="text-slate-800 uppercase">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-block border px-3 py-1 rounded-full text-xs font-extrabold uppercase ${getStatusBadgeClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items Panel */}
              <div className="p-6 divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <img
                      src={item.image || "https://picsum.photos/seed/product/900/900"}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-50 border"
                      alt={item.name}
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product}`} className="font-bold text-slate-900 hover:text-indigo-600 truncate block">
                        {item.name}
                      </Link>
                      <div className="flex gap-3 text-xs text-slate-400 mt-1">
                        <span>Quantity: <strong>{item.quantity}</strong></span>
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

              {/* Footer Summary & Action row */}
              <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm">
                  <span className="text-slate-500 font-medium">Total Amount: </span>
                  <strong className="text-slate-950 font-black text-base">₹{Number(order.totalAmount).toLocaleString("en-IN")}</strong>
                </div>

                <div className="flex gap-2">
                  {isCancellable(order.orderStatus) && (
                    <button
                      onClick={() => handleCancelClick(order._id)}
                      className="btn-light !py-2 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold"
                    >
                      Cancel Order
                    </button>
                  )}
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-primary !py-2 text-xs font-bold flex items-center gap-1.5"
                  >
                    Track Order
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal Dialog */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 bg-white border max-w-md w-full rounded-3xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertTriangle size={24} />
              <h2 className="text-lg font-black text-slate-900">Cancel Order</h2>
            </div>
            
            <p className="text-slate-500 text-xs leading-relaxed">
              Are you sure you want to cancel this booking? This action will rollback product stock.
            </p>

            <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
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
                  <option value="Other">Other (Write reason below)</option>
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
                    placeholder="Provide details about why you want to cancel..."
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
                  {cancelling ? "Cancelling..." : "Confirm Cancellation"}
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
