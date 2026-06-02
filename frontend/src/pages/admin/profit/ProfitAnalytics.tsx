import React, { useState } from "react";
import { FiDownload, FiCalendar } from "react-icons/fi";

export default function ProfitAnalytics() {
  const [selectedMonth, setSelectedMonth] = useState("6");
  const [selectedYear, setSelectedYear] = useState("2026");

  const profitData = {
    totalRevenue: 524000,
    totalProductCost: 245000,
    totalDeliveryCost: 52400,
    totalOperationalCost: 42000,
    netProfit: 184600,
    grossProfit: 279000,
    profitMarginPercentage: 35.2,
  };

  const monthlyProfits = [
    { month: "January", profit: 85000, revenue: 280000 },
    { month: "February", profit: 92000, revenue: 310000 },
    { month: "March", profit: 78000, revenue: 265000 },
    { month: "April", profit: 95000, revenue: 330000 },
    { month: "May", profit: 102000, revenue: 380000 },
    { month: "June", profit: 184600, revenue: 524000 },
  ];

  const productProfits = [
    {
      product: "20L Jar",
      revenue: 180000,
      cost: 75000,
      profit: 105000,
      margin: 58.3,
    },
    {
      product: "10L Jar",
      revenue: 150000,
      cost: 72000,
      profit: 78000,
      margin: 52,
    },
    {
      product: "5L Jar",
      revenue: 95000,
      cost: 38000,
      profit: 57000,
      margin: 60,
    },
    {
      product: "2L Case",
      revenue: 89000,
      cost: 45000,
      profit: 44000,
      margin: 49.4,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profit Analytics</h1>
          <p className="text-gray-500 mt-1">
            Detailed profit breakdown and margin analysis.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
          <FiDownload size={18} />
          Export Report
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition mt-6">
          Generate Report
        </button>
      </div>

      {/* Profit Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <p className="text-sm text-blue-700 font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            ₹{(profitData.totalRevenue / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-blue-600 mt-2">100% vs last month</p>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <p className="text-sm text-red-700 font-medium">Product Cost</p>
          <p className="text-3xl font-bold text-red-900 mt-2">
            ₹{(profitData.totalProductCost / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-red-600 mt-2">
            {(
              (profitData.totalProductCost / profitData.totalRevenue) *
              100
            ).toFixed(1)}
            % of revenue
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
          <p className="text-sm text-orange-700 font-medium">Delivery Cost</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">
            ₹{(profitData.totalDeliveryCost / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-orange-600 mt-2">
            {(
              (profitData.totalDeliveryCost / profitData.totalRevenue) *
              100
            ).toFixed(1)}
            % of revenue
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <p className="text-sm text-purple-700 font-medium">
            Operational Cost
          </p>
          <p className="text-3xl font-bold text-purple-900 mt-2">
            ₹{(profitData.totalOperationalCost / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-purple-600 mt-2">
            {(
              (profitData.totalOperationalCost / profitData.totalRevenue) *
              100
            ).toFixed(1)}
            % of revenue
          </p>
        </div>
      </div>

      {/* Net & Gross Profit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
          <p className="text-sm text-green-700 font-medium">Gross Profit</p>
          <p className="text-4xl font-bold text-green-900 mt-2">
            ₹{(profitData.grossProfit / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-green-600 mt-2">
            Calculation: Revenue - Product Cost
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6">
          <p className="text-sm text-emerald-700 font-medium">Net Profit</p>
          <p className="text-4xl font-bold text-emerald-900 mt-2">
            ₹{(profitData.netProfit / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-emerald-600 mt-2">
            Calculation: Gross Profit - Delivery & Operational Cost
          </p>
        </div>
      </div>

      {/* Profit Margin */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Profit Margin</p>
        <div className="flex items-end gap-4">
          <div>
            <p className="text-4xl font-bold text-emerald-600">
              {profitData.profitMarginPercentage}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Healthy margin indicating strong profitability
            </p>
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-emerald-600 h-3 rounded-full"
                style={{ width: `${profitData.profitMarginPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Target: 30%</p>
          </div>
        </div>
      </div>

      {/* Monthly Profit Trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Monthly Profit Trend
        </h3>
        <div className="space-y-3">
          {monthlyProfits.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {item.month}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  ₹{(item.profit / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${(item.profit / 200000) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profit by Product */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Profit by Product
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Product
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  Cost
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  Profit
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  Margin %
                </th>
              </tr>
            </thead>
            <tbody>
              {productProfits.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {item.product}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    ₹{(item.revenue / 1000).toFixed(0)}K
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    ₹{(item.cost / 1000).toFixed(0)}K
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">
                    ₹{(item.profit / 1000).toFixed(0)}K
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {item.margin}%
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
