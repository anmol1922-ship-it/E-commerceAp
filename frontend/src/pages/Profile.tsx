import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api
        .get("/orders/my-orders")
        .then(({ data }) => {
          setOrders(data.orders || []);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>{" "}
            <span className="font-medium text-gray-900">{user.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>{" "}
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-500">Role:</span>{" "}
            <span className="font-medium text-gray-900 capitalize">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
        Order History
      </h2>
      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-mono text-gray-500">
                  #{order._id.slice(-8)}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    order.status === "delivered"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  {order.items?.length} item(s) — ₹{order.totalAmount}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
