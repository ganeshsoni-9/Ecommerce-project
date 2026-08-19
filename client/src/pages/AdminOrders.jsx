import { useEffect, useState } from "react";
import { listAllOrders, updateOrderStatus } from "../services/orderService";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";
import { Eye, Edit2, CheckCircle, Package, Truck, ShieldAlert } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      // Refresh list
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
      case "CONFIRMED":
        return "bg-indigo-100 text-indigo-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
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

  if (loading) {
    return (
      <div className="py-20">
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
          className="btn-light text-sm font-semibold"
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
            className="input w-full text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto items-center justify-end">
          <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select"
          >
            <option value="all">All Bookings</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
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
                {filteredOrders.map((order) => (
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
                            <span className="font-semibold text-slate-800">{item.name}</span>
                            <span className="text-slate-400"> × {item.quantity}</span>
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
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1.5 uppercase ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Action Selector */}
                    <td className="p-4 pr-6 text-center">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="select select-sm text-xs font-bold max-w-[150px] mx-auto block"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                  </tr>
                ))}
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
    </div>
  );
}