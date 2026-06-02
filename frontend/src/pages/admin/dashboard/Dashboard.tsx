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
} from "react-icons/fi";

interface KPICard {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
  isPositive: boolean;
  bgColor: string;
  textColor: string;
}

export default function AdminDashboard() {
  const [kpiData, setKpiData] = useState<KPICard[]>([
    {
      label: "Total Orders Today",
      value: "₹24,500",
      icon: <FiShoppingCart className="w-8 h-8" />,
      trend: 12,
      isPositive: true,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Revenue Today",
      value: "₹18,400",
      icon: <FiDollarSign className="w-8 h-8" />,
      trend: 8,
      isPositive: true,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Profit Today",
      value: "₹6,200",
      icon: <FiTrendingUp className="w-8 h-8" />,
      trend: 5,
      isPositive: true,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Active Customers",
      value: "483",
      icon: <FiUsers className="w-8 h-8" />,
      trend: 15,
      isPositive: true,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Total Stock Value",
      value: "₹82,500",
      icon: <FiBox className="w-8 h-8" />,
      trend: -3,
      isPositive: false,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Low Stock Items",
      value: "12",
      icon: <FiAlertTriangle className="w-8 h-8" />,
      trend: 8,
      isPositive: false,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "Pending Deliveries",
      value: "45",
      icon: <FiBox className="w-8 h-8" />,
      trend: -5,
      isPositive: true,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Pending Jar Returns",
      value: "8",
      icon: <FiRefreshCw className="w-8 h-8" />,
      trend: 12,
      isPositive: false,
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's your business overview.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div
            key={index}
            className={`${kpi.bgColor} rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {kpi.value}
                </h3>
                <div className="flex items-center gap-1 mt-2">
                  {kpi.isPositive ? (
                    <FiTrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <FiTrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      kpi.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {kpi.isPositive ? "+" : ""}
                    {kpi.trend}%
                  </span>
                  <span className="text-xs text-gray-500">vs yesterday</span>
                </div>
              </div>
              <div className={`${kpi.textColor} opacity-20`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue This Month */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Revenue This Month
          </h3>
          <div className="mb-4">
            <p className="text-4xl font-bold text-emerald-600">₹5,24,000</p>
            <p className="text-sm text-gray-500 mt-1">
              <span className="inline-flex items-center gap-1 text-green-600">
                <FiTrendingUp size={16} />
                14% increase
              </span>
              compared to last month
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Target</span>
              <span className="font-medium">₹6,00,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{ width: "87%" }}
              />
            </div>
          </div>
        </div>

        {/* Profit This Month */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Profit This Month
          </h3>
          <div className="mb-4">
            <p className="text-4xl font-bold text-blue-600">₹1,68,000</p>
            <p className="text-sm text-gray-500 mt-1">
              <span className="inline-flex items-center gap-1 text-green-600">
                <FiTrendingUp size={16} />
                32% increase
              </span>
              compared to last month
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profit Margin</span>
              <span className="font-medium">32%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "32%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Year Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Revenue This Year</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹32,50,000</p>
          <p className="text-xs text-green-600 mt-2">↑ 28% vs last year</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Profit This Year</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹10,40,000</p>
          <p className="text-xs text-green-600 mt-2">↑ 35% vs last year</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">
            Average Order Value
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹1,240</p>
          <p className="text-xs text-green-600 mt-2">↑ 8% vs last month</p>
        </div>
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-80">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Daily Revenue
          </h3>
          <div className="flex items-center justify-center h-full text-gray-400">
            Chart will be rendered here (Chart.js / Recharts)
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-80">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Best Selling Products
          </h3>
          <div className="flex items-center justify-center h-full text-gray-400">
            Chart will be rendered here (Chart.js / Recharts)
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
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
              {[
                {
                  id: "ORD-001",
                  customer: "Anmol Gupta",
                  amount: "₹250",
                  status: "Delivered",
                  date: "2026-06-01",
                },
                {
                  id: "ORD-002",
                  customer: "Priya Singh",
                  amount: "₹480",
                  status: "Dispatched",
                  date: "2026-06-01",
                },
                {
                  id: "ORD-003",
                  customer: "Rajesh Kumar",
                  amount: "₹175",
                  status: "Confirmed",
                  date: "2026-06-01",
                },
              ].map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {order.amount}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Dispatched"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
