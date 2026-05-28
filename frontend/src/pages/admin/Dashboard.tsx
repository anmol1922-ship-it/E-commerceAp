import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Navigate, Link } from "react-router-dom";
import api from "../../api/axios";

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      api
        .get("/orders/admin/dashboard")
        .then(({ data }) => setStats(data.stats))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="flex gap-4 mb-8">
        <Link
          to="/admin/products"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          Manage Products
        </Link>
        <Link
          to="/admin/orders"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          Manage Orders
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading stats...</p>
      ) : stats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">
              ₹{stats.totalRevenue}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">
              {stats.pendingOrders}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.totalProducts}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
