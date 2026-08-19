import { useEffect, useState } from "react";
import { dashboard } from "../services/adminService";
import StatCard from "../components/admin/StatCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import api from "../services/api";

export default function AdminDashboard() {
  const [d, setD] = useState(null);
  const [a, setA] = useState([]);

  useEffect(() => {
    dashboard().then((r) => setD(r.data.data));
    api.get("/analytics/dashboard")
      .then((r) => setA(r.data.data.revenue))
      .catch(() => {});
  }, []);

  if (!d) return <div className="p-6 text-slate-500">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time store performance and user metrics.</p>
      </div>

      {/* Revenue & General Stats */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-4">Financials & Products</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={`₹${Number(d.revenue).toLocaleString()}`} />
          <StatCard label="Total Products" value={d.products} />
          <StatCard label="Total Categories" value={d.categories} />
          <StatCard label="Total Reviews" value={d.reviews} />
        </div>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-4">User Accounts</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Users" value={d.totalUsers} />
          <StatCard label="Verified Accounts" value={d.verifiedUsers} />
          <StatCard label="Unverified (Pending)" value={d.unverifiedUsers} />
          <StatCard label="Active Accounts" value={d.activeUsers} />
          <StatCard label="Blocked/Deactivated" value={d.blockedUsers} />
        </div>
      </div>

      {/* Order Statistics */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-4">Order Lifecycle</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={d.orders} />
          <StatCard label="Pending/Processing" value={d.pendingOrders} />
          <StatCard label="Delivered Orders" value={d.completedOrders} />
          <StatCard label="Cancelled Orders" value={d.cancelledOrders} />
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
        <h2 className="font-bold text-slate-800 mb-4">Monthly Revenue Trend</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={a}>
              <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
