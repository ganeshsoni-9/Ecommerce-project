import { useEffect, useState } from "react";
import { listAllOrders, updateOrderStatus } from "../services/orderService";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";
import { Eye, CheckCircle, Package, Truck, ShieldAlert, X } from "lucide-react";

const STAGES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Shipping Modal state
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState("");
  const [courierName, setCourierName] = useState("Delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [submittingShipping, setSubmittingShipping] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await listAllOrders();
      setOrders(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusSelectChange = async (orderId, currentStatus, newStatus) => {
    if (newStatus === "SHIPPED") {
      // Open modal to collect shipping details
      setShippingOrderId(orderId);
      setCourierName("Delhivery");
      setTrackingNumber("");
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      setEstimatedDelivery(futureDate.toISOString().split("T")[0]);
      
      setShowShippingModal(true);
      return;
    }

    try {
      setLoading(true);
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
      setLoading(false);
    }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber) {
      toast.error("Please enter a tracking number");
      return;
    }

    try {
      setSubmittingShipping(true);
      await updateOrderStatus(shippingOrderId, "SHIPPED", {
        courierName,
        trackingNumber,
        estimatedDeliveryDate: estimatedDelivery
      });
      toast.success("Order shipped successfully with tracking info");
      setShowShippingModal(false);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update shipping status");
    } finally {
      setSubmittingShipping(false);
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

  const getAvailableOptions = (currentStatus) => {
    if (currentStatus === "CANCELLED" || currentStatus === "DELIVERED") {
      return [currentStatus];
    }
    const idx = STAGES.indexOf(currentStatus);
    if (idx === -1) return STAGES;
    
    // Admin can keep it same, progress forward, or cancel
    const options = STAGES.slice(idx);
    options.push("CANCELLED");
    return options;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading && orders.length === 0) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Order Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review bookings, verify payment statuses, and update shipment tracking.</p>
        </div>
        <button 
          onClick={loadOrders} 
          className="btn-light text-sm font-semibold py-2 px-4 bg-white"
        >
          Refresh Data
        </button>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="card p-5 mt-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm bg-white border border-slate-200 rounded-2xl">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search order no. or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full text-slate-800 placeholder-slate-400 py-2.5"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto items-center justify-end">
          <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select py-2 px-3 border border-slate-350 rounded-xl text-sm"
          >
            <option value="all">All Bookings</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Order Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Ordered</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-center">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredOrders.map((order) => {
                  const allowedOptions = getAvailableOptions(order.orderStatus);
                  const isLocked = order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED";

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition">
                      {/* Order No */}
                      <td className="p-4 pl-6 font-bold text-slate-900">
                        {order.orderNumber}
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{order.user?.name || "Guest Customer"}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{order.user?.email}</div>
                        {order.user?.phone && (
                          <div className="text-xs text-slate-400">{order.user?.phone}</div>
                        )}
                      </td>

                      {/* Items */}
                      <td className="p-4">
                        <div className="max-w-[220px] divide-y divide-slate-100/50">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="py-1 text-xs first:pt-0 last:pb-0">
                              <span className="font-semibold text-slate-850">{item.name}</span>
                              <span className="text-slate-400"> × {item.quantity}</span>
                              {(item.size || item.color) && (
                                <span className="block text-[10px] text-slate-400">
                                  {item.size && `S: ${item.size}`} {item.color && `C: ${item.color}`}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-extrabold text-slate-900">
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </td>

                      {/* Payment */}
                      <td className="p-4">
                        <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                          {order.paymentMethod || "COD"}
                        </div>
                        <span className={`inline-block border px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1.5 uppercase ${
                          order.paymentStatus === "PAID" ? "bg-green-105 border-green-200 text-green-800" : "bg-yellow-105 border-yellow-200 text-yellow-800"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <span className={`inline-block border px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide ${getStatusBadgeClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Action Selector */}
                      <td className="p-4 pr-6 text-center">
                        <select
                          value={order.orderStatus}
                          disabled={isLocked}
                          onChange={(e) => handleStatusSelectChange(order._id, order.orderStatus, e.target.value)}
                          className="select select-sm text-xs font-bold max-w-[150px] mx-auto block disabled:opacity-50 py-1.5 border rounded-xl"
                        >
                          {!allowedOptions.includes(order.orderStatus) && (
                            <option value={order.orderStatus}>{order.orderStatus}</option>
                          )}
                          {allowedOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <h3 className="text-lg font-bold text-slate-800">No bookings match the filter</h3>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your search queries or category filters.</p>
          </div>
        )}
      </div>

      {/* Shipping Details Modal Dialog */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 bg-white border max-w-md w-full rounded-3xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck size={20} className="text-indigo-600" />
                Shipped Tracking Details
              </h2>
              <button onClick={() => setShowShippingModal(false)} className="text-slate-400 hover:text-slate-655 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Courier Partner Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhivery, Blue Dart, DTDC"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Tracking / AWB Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  required
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingShipping}
                  className="btn-primary flex-1 py-3 text-xs font-bold disabled:opacity-50"
                >
                  {submittingShipping ? "Saving..." : "Confirm Shipment"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowShippingModal(false)}
                  className="btn-light flex-1 py-3 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}