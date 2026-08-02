import React, { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiBox,
  FiShoppingCart,
  FiDollarSign,
  FiUsers,
  FiAlertTriangle,
  FiRefreshCw,
  FiLoader,
} from "react-icons/fi";
import api from "../../../api/axios";

interface KPIData {
  ordersTodayCount: number;
  ordersTodayAmount: number;
  ordersTodayTrend: number;
  revenueTodayAmount: number;
  revenueTodayTrend: number;
  profitTodayAmount: number;
  profitTodayTrend: number;
  activeCustomersCount: number;
  activeCustomersTrend: number;
  stockValueTotal: number;
  stockValueTrend: number;
  lowStockItemsCount: number;
  pendingDeliveriesCount: number;
  pendingDeliveriesTrend: number;
  pendingJarReturnsCount: number;
  pendingJarReturnsTrend: number;
}

interface MonthlyStats {
  revenueThisMonth: number;
  revenueTarget: number;
  revenueProgress: number;
  profitThisMonth: number;
  profitMargin: number;
  yearToDateRevenue: number;
  yearToDateProfit: number;
  averageOrderValue: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  itemCount: number;
  createdAt: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, monthlyRes, ordersRes] = await Promise.all([
        api.get("/admin/dashboard/kpis"),
        api.get("/admin/dashboard/monthly-stats"),
        api.get("/admin/dashboard/recent-orders?limit=10"),
      ]);

      if (kpiRes.data.success) setKpiData(kpiRes.data.data);
      if (monthlyRes.data.success) setMonthlyStats(monthlyRes.data.data);
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "dispatched":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-yellow-100 text-yellow-700";
      case "placed":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <FiAlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const kpiCards = kpiData
    ? [
        {
          label: "Orders Today",
          value: `${kpiData.ordersTodayCount} (${formatCurrency(kpiData.ordersTodayAmount)})`,
          icon: <FiShoppingCart className="w-8 h-8" />,
          trend: kpiData.ordersTodayTrend,
          bgColor: "bg-blue-50",
          textColor: "text-blue-600",
        },
        {
          label: "Revenue Today",
          value: formatCurrency(kpiData.revenueTodayAmount),
          icon: <FiDollarSign className="w-8 h-8" />,
          trend: kpiData.revenueTodayTrend,
          bgColor: "bg-green-50",
          textColor: "text-green-600",
        },
        {
          label: "Profit Today",
          value: formatCurrency(kpiData.profitTodayAmount),
          icon: <FiTrendingUp className="w-8 h-8" />,
          trend: kpiData.profitTodayTrend,
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-600",
        },
        {
          label: "Active Customers (30d)",
          value: kpiData.activeCustomersCount.toString(),
          icon: <FiUsers className="w-8 h-8" />,
          trend: kpiData.activeCustomersTrend,
          bgColor: "bg-purple-50",
          textColor: "text-purple-600",
        },
        {
          label: "Total Stock Value",
          value: formatCurrency(kpiData.stockValueTotal),
          icon: <FiBox className="w-8 h-8" />,
          trend: kpiData.stockValueTrend,
          bgColor: "bg-orange-50",
          textColor: "text-orange-600",
        },
        {
          label: "Low Stock Items",
          value: kpiData.lowStockItemsCount.toString(),
          icon: <FiAlertTriangle className="w-8 h-8" />,
          trend: 0,
          bgColor: kpiData.lowStockItemsCount > 0 ? "bg-red-50" : "bg-green-50",
          textColor:
            kpiData.lowStockItemsCount > 0 ? "text-red-600" : "text-green-600",
        },
        {
          label: "Pending Deliveries",
          value: kpiData.pendingDeliveriesCount.toString(),
          icon: <FiBox className="w-8 h-8" />,
          trend: kpiData.pendingDeliveriesTrend,
          bgColor: "bg-indigo-50",
          textColor: "text-indigo-600",
        },
        {
          label: "Pending Jar Returns",
          value: kpiData.pendingJarReturnsCount.toString(),
          icon: <FiRefreshCw className="w-8 h-8" />,
          trend: kpiData.pendingJarReturnsTrend,
          bgColor: "bg-pink-50",
          textColor: "text-pink-600",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const isPositive = kpi.trend >= 0;
          return (
            <div
              key={index}
              className={`${kpi.bgColor} rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {kpi.label}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {kpi.value}
                  </h3>
                  {kpi.trend !== 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {isPositive ? (
                        <FiTrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <FiTrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {kpi.trend}%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs yesterday
                      </span>
                    </div>
                  )}
                </div>
                <div className={`${kpi.textColor} opacity-20`}>{kpi.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Stats */}
      {monthlyStats && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Revenue This Month
              </h3>
              <div className="mb-4">
                <p className="text-4xl font-bold text-emerald-600">
                  {formatCurrency(monthlyStats.revenueThisMonth)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Target: {formatCurrency(monthlyStats.revenueTarget)}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="font-medium">
                    {monthlyStats.revenueProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(monthlyStats.revenueProgress, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Profit This Month
              </h3>
              <div className="mb-4">
                <p className="text-4xl font-bold text-blue-600">
                  {formatCurrency(monthlyStats.profitThisMonth)}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profit Margin</span>
                  <span className="font-medium">
                    {monthlyStats.profitMargin}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(monthlyStats.profitMargin, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-600">
                Revenue This Year
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(monthlyStats.yearToDateRevenue)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-600">
                Profit This Year
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(monthlyStats.yearToDateProfit)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-600">
                Average Order Value
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(monthlyStats.averageOrderValue)}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent orders</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Items
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {order.id.slice(0, 12)}...
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.itemCount}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
