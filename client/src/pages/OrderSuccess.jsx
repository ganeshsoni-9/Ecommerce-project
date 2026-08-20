import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { getOrder } from "../services/orderService";
import Loader from "../components/common/Loader";
import { CheckCircle, Calendar, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Resolve ID from path params or query params (support both /order-success/:id and /order-success?order=id)
  const resolvedOrderId = orderId || searchParams.get("order");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!resolvedOrderId) {
        toast.error("No order ID provided");
        navigate("/orders");
        return;
      }
      try {
        setLoading(true);
        const res = await getOrder(resolvedOrderId);
        setOrder(res.data?.data || res.data || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load order success details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [resolvedOrderId]);

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
        <h1 className="text-2xl font-black text-slate-800">Order not found</h1>
        <p className="text-slate-500 mt-2">We couldn't retrieve the details for this order.</p>
        <Link to="/shop" className="btn-primary mt-6">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      <div className="card p-8 bg-white border border-slate-200 rounded-3xl shadow-xl relative text-center space-y-6">
        
        {/* Success Icon */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-650 mb-4 shadow-inner">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Order Placed Successfully!</h1>
          <p className="text-slate-500 text-sm mt-1">
            Thank you for shopping with us. Your booking has been registered.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Number</span>
              <p className="font-extrabold text-slate-900 text-base">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
              <p className="font-black text-indigo-600 text-lg">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="flex gap-2">
              <Calendar size={18} className="text-slate-450 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Estimated Delivery</strong>
                <span className="text-xs text-slate-500">
                  {order.estimatedDeliveryDate
                    ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })
                    : "Within 3-5 business days"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <CreditCard size={18} className="text-slate-450 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Payment Details</strong>
                <span className="text-xs text-slate-500 uppercase">
                  {order.paymentMethod} · {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-200 text-sm text-slate-700">
            <MapPin size={18} className="text-slate-450 mt-0.5" />
            <div>
              <strong className="block text-slate-900">Shipping Address</strong>
              <p className="text-xs text-slate-500">
                <strong>{order.shippingAddress?.fullName}</strong>, {order.shippingAddress?.address},{" "}
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to={`/orders/${order._id}`}
            className="btn-primary flex-1 py-3.5 text-center font-bold tracking-wide flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={18} />
            Track Order
          </Link>
          <Link
            to="/orders"
            className="btn-light flex-1 py-3.5 text-center font-semibold"
          >
            View My Orders
          </Link>
        </div>

        <div className="pt-2">
          <Link to="/shop" className="text-xs font-bold text-indigo-600 hover:text-indigo-850 transition">
            ← Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}