import React, { useState, useEffect } from "react";
import { FiDownload, FiLoader, FiAlertTriangle } from "react-icons/fi";
import api from "../../../api/axios";

interface ProfitReport {
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  productCost: number;
  deliveryCost: number;
  operationalCost: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  orderCount: number;
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
}

const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
};

export default function ProfitAnalytics() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    (now.getMonth() + 1).toString(),
  );
  const [selectedYear, setSelectedYear] = useState(
    now.getFullYear().toString(),
  );
  const [profitData, setProfitData] = useState<ProfitReport | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfitData = async () => {
    setLoading(true);
    setError(null);
    try {
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);
      const startDate = new Date(year, month - 1, 1)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const [reportRes, trendsRes] = await Promise.all([
        api.get("/admin/profit/report", {
          params: { startDate, endDate },
        }),
        api.get("/admin/profit/trends/monthly", {
          params: { year: selectedYear },
        }),
      ]);

      if (reportRes.data.success) setProfitData(reportRes.data.data);
      if (trendsRes.data.success) setMonthlyTrends(trendsRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load profit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitData();
  }, []);

  const handleGenerate = () => {
    fetchProfitData();
  };

  const handleExport = async () => {
    try {
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);
      const startDate = new Date(year, month - 1, 1)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const { data } = await api.get("/admin/export/orders", {
        params: { startDate, endDate, format: "csv" },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `profit-report-${selectedYear}-${selectedMonth}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // silent fallback
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-gray-500">Loading profit analytics...</span>
      </div>
    );
  }

  if (error && !profitData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <FiAlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchProfitData}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const months = [
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
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
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
            {months.map((m, i) => (
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
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ),
            )}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition mt-6"
        >
          Generate Report
        </button>
      </div>

      {profitData && (
        <>
          {/* Profit Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <p className="text-sm text-blue-700 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {formatCurrency(profitData.totalRevenue)}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                {profitData.orderCount} orders
              </p>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <p className="text-sm text-red-700 font-medium">Product Cost</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {formatCurrency(profitData.productCost)}
              </p>
              <p className="text-xs text-red-600 mt-2">
                {profitData.totalRevenue > 0
                  ? (
                      (profitData.productCost / profitData.totalRevenue) *
                      100
                    ).toFixed(1)
                  : 0}
                % of revenue
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
              <p className="text-sm text-orange-700 font-medium">
                Delivery Cost
              </p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {formatCurrency(profitData.deliveryCost)}
              </p>
              <p className="text-xs text-orange-600 mt-2">
                {profitData.totalRevenue > 0
                  ? (
                      (profitData.deliveryCost / profitData.totalRevenue) *
                      100
                    ).toFixed(1)
                  : 0}
                % of revenue
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
              <p className="text-sm text-purple-700 font-medium">
                Operational Cost
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {formatCurrency(profitData.operationalCost)}
              </p>
              <p className="text-xs text-purple-600 mt-2">
                {profitData.totalRevenue > 0
                  ? (
                      (profitData.operationalCost / profitData.totalRevenue) *
                      100
                    ).toFixed(1)
                  : 0}
                % of revenue
              </p>
            </div>
          </div>

          {/* Net & Gross Profit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
              <p className="text-sm text-green-700 font-medium">Gross Profit</p>
              <p className="text-4xl font-bold text-green-900 mt-2">
                {formatCurrency(profitData.grossProfit)}
              </p>
              <p className="text-xs text-green-600 mt-2">
                Revenue - Product Cost
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6">
              <p className="text-sm text-emerald-700 font-medium">Net Profit</p>
              <p className="text-4xl font-bold text-emerald-900 mt-2">
                {formatCurrency(profitData.netProfit)}
              </p>
              <p className="text-xs text-emerald-600 mt-2">
                Gross Profit - Delivery & Operational Cost
              </p>
            </div>
          </div>

          {/* Profit Margin */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Profit Margin
            </p>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-4xl font-bold text-emerald-600">
                  {profitData.profitMargin}%
                </p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(Math.max(profitData.profitMargin, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Monthly Profit Trend */}
      {monthlyTrends.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Monthly Profit Trend ({selectedYear})
          </h3>
          <div className="space-y-3">
            {monthlyTrends
              .filter((t) => t.revenue > 0)
              .map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.month}
                    </span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-500">
                        Revenue: {formatCurrency(item.revenue)}
                      </span>
                      <span className="font-bold text-emerald-700">
                        Profit: {formatCurrency(item.profit)}
                      </span>
                      <span className="text-gray-600">
                        ({item.marginPercent}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (item.profit /
                            Math.max(
                              ...monthlyTrends.map((t) => t.profit || 1),
                            )) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
          {monthlyTrends.every((t) => t.revenue === 0) && (
            <p className="text-gray-500 text-center py-4">
              No revenue data for {selectedYear}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
