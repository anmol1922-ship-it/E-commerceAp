import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Navigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const STATUSES = [
  "placed",
  "confirmed",
  "dispatched",
  "delivered",
  "cancelled",
];

export default function AdminOrders() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/admin/all?limit=50");
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/admin/${id}/status`, { status });
      toast.success("Status updated");
      fetchOrders();
    } catch {
      toast.error("Update failed");
    }
  };

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Orders</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-mono text-gray-500">
                    #{order._id?.slice(-8)}
                  </p>
                  <p className="text-sm text-gray-700">
                    {order.user?.name} — {order.user?.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ₹{order.totalAmount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-gray-500">Status:</span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-500">
                  Payment: {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
