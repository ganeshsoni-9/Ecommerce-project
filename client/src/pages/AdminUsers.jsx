import { useEffect, useState } from "react";
import { users, updateRole, toggleUserStatus } from "../services/adminService";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [u, setU] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    users()
      .then((r) => {
        setU(r.data?.data || r.data || []);
      })
      .catch((err) => {
        toast.error("Failed to load users list");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(load, []);

  const handleRoleChange = async (id, e) => {
    try {
      await updateRole(id, e.target.value);
      toast.success("User role updated successfully");
      load();
    } catch (x) {
      toast.error(x.response?.data?.message || "Failed to update role");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id);
      toast.success("User account status toggled");
      load();
    } catch (x) {
      toast.error(x.response?.data?.message || "Failed to change user status");
    }
  };

  if (loading && u.length === 0) {
    return <div className="p-6 text-slate-500 text-center">Loading user accounts...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">Configure user roles, account active statuses, and verify registration modes.</p>
      </div>

      <div className="card overflow-hidden bg-white border border-slate-100 shadow-sm rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-left text-slate-500 font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Method</th>
                <th className="p-4">Verified</th>
                <th className="p-4">Status</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {u.map((x) => (
                <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors" key={x._id}>
                  <td className="p-4 font-medium text-slate-900">{x.name}</td>
                  <td className="p-4">{x.email || "N/A"}</td>
                  <td className="p-4">{x.phone || "N/A"}</td>
                  <td className="p-4 font-mono text-xs">{x.verificationMethod || "EMAIL"}</td>
                  <td className="p-4">
                    {x.isVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Verification
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {x.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <select
                      className="input !w-auto !py-1 !px-2 rounded border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                      value={x.role}
                      onChange={(e) => handleRoleChange(x._id, e)}
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(x._id)}
                      className={`btn-sm px-3 py-1.5 rounded-md font-semibold text-xs transition duration-150 ${
                        x.isActive
                          ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                          : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-200"
                      }`}
                    >
                      {x.isActive ? "Block User" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
