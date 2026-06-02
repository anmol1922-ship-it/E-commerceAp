import React, { useState } from "react";
import {
  FiTrendingDown,
  FiAlertTriangle,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";

interface StockForecast {
  id: string;
  productName: string;
  productSku: string;
  currentStock: number;
  dailyBurnRate: number;
  daysRemaining: number;
  reorderLevel: number;
  recommendedOrderQty: number;
  forecastStatus: "critical" | "warning" | "adequate" | "excess";
  lastRestockDate: string;
  avgDailyUsage: number;
}

export default function StockForecast() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("daysRemaining");

  const mockForecasts: StockForecast[] = [
    {
      id: "1",
      productName: "20L Water Jar",
      productSku: "W20L-001",
      currentStock: 45,
      dailyBurnRate: 35,
      daysRemaining: 1.3,
      reorderLevel: 100,
      recommendedOrderQty: 500,
      forecastStatus: "critical",
      lastRestockDate: "2026-06-10",
      avgDailyUsage: 35,
    },
    {
      id: "2",
      productName: "10L Water Jar",
      productSku: "W10L-001",
      currentStock: 120,
      dailyBurnRate: 28,
      daysRemaining: 4.3,
      reorderLevel: 80,
      recommendedOrderQty: 300,
      forecastStatus: "warning",
      lastRestockDate: "2026-06-08",
      avgDailyUsage: 28,
    },
    {
      id: "3",
      productName: "5L Bottle",
      productSku: "W5L-002",
      currentStock: 180,
      dailyBurnRate: 18,
      daysRemaining: 10,
      reorderLevel: 60,
      recommendedOrderQty: 200,
      forecastStatus: "adequate",
      lastRestockDate: "2026-06-05",
      avgDailyUsage: 18,
    },
    {
      id: "4",
      productName: "20L Premium Jar",
      productSku: "WP20L-001",
      currentStock: 85,
      dailyBurnRate: 12,
      daysRemaining: 7.1,
      reorderLevel: 50,
      recommendedOrderQty: 250,
      forecastStatus: "warning",
      lastRestockDate: "2026-06-09",
      avgDailyUsage: 12,
    },
    {
      id: "5",
      productName: "Mineral Water 500ml",
      productSku: "WM500-001",
      currentStock: 450,
      dailyBurnRate: 25,
      daysRemaining: 18,
      reorderLevel: 100,
      recommendedOrderQty: 400,
      forecastStatus: "adequate",
      lastRestockDate: "2026-06-12",
      avgDailyUsage: 25,
    },
    {
      id: "6",
      productName: "Distilled Water 1L",
      productSku: "WD1L-001",
      currentStock: 350,
      dailyBurnRate: 8,
      daysRemaining: 43.75,
      reorderLevel: 50,
      recommendedOrderQty: 200,
      forecastStatus: "excess",
      lastRestockDate: "2026-06-01",
      avgDailyUsage: 8,
    },
    {
      id: "7",
      productName: "Spring Water 20L",
      productSku: "WS20L-001",
      currentStock: 15,
      dailyBurnRate: 22,
      daysRemaining: 0.68,
      reorderLevel: 80,
      recommendedOrderQty: 400,
      forecastStatus: "critical",
      lastRestockDate: "2026-06-11",
      avgDailyUsage: 22,
    },
  ];

  const getStatusColor = (status: StockForecast["forecastStatus"]) => {
    const colors = {
      critical: "text-red-600 bg-red-50",
      warning: "text-orange-600 bg-orange-50",
      adequate: "text-green-600 bg-green-50",
      excess: "text-blue-600 bg-blue-50",
    };
    return colors[status];
  };

  const getStatusBadgeColor = (status: StockForecast["forecastStatus"]) => {
    const colors = {
      critical: "bg-red-100 text-red-700",
      warning: "bg-orange-100 text-orange-700",
      adequate: "bg-green-100 text-green-700",
      excess: "bg-blue-100 text-blue-700",
    };
    return colors[status];
  };

  const getStatusLabel = (status: StockForecast["forecastStatus"]) => {
    const labels = {
      critical: "Critical - Order Now",
      warning: "Warning - Order Soon",
      adequate: "Adequate Stock",
      excess: "Excess Stock",
    };
    return labels[status];
  };

  const filteredForecasts = mockForecasts
    .filter(
      (forecast) =>
        forecast.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forecast.productSku.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "daysRemaining") return a.daysRemaining - b.daysRemaining;
      if (sortBy === "status") {
        const statusOrder = { critical: 0, warning: 1, adequate: 2, excess: 3 };
        return statusOrder[a.forecastStatus] - statusOrder[b.forecastStatus];
      }
      return 0;
    });

  const criticalCount = mockForecasts.filter(
    (f) => f.forecastStatus === "critical",
  ).length;
  const warningCount = mockForecasts.filter(
    (f) => f.forecastStatus === "warning",
  ).length;
  const avgDaysRemaining = (
    mockForecasts.reduce((sum, f) => sum + f.daysRemaining, 0) /
    mockForecasts.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stock Forecast</h1>
        <p className="text-gray-500 mt-1">
          Predictive stock analysis with automatic reorder recommendations.
        </p>
      </div>

      {/* Alert Banner */}
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <FiAlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900">
              {criticalCount} Critical, {warningCount} Warning
            </h3>
            <p className="text-red-700 text-sm mt-1">
              You have {criticalCount + warningCount} products that need
              immediate attention. Consider placing orders to avoid stockouts.
            </p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Critical Stock",
            value: criticalCount.toString(),
            color: "bg-red-100 text-red-700",
          },
          {
            label: "Warning Stock",
            value: warningCount.toString(),
            color: "bg-orange-100 text-orange-700",
          },
          {
            label: "Avg Days Remaining",
            value: avgDaysRemaining + " days",
            color: "bg-blue-100 text-blue-700",
          },
          {
            label: "Total Products",
            value: mockForecasts.length.toString(),
            color: "bg-gray-100 text-gray-700",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            <p
              className={`text-2xl font-bold mt-2 ${stat.color.split(" ")[1]}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
            >
              <option value="daysRemaining">Sort by: Days Remaining</option>
              <option value="status">Sort by: Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forecast Cards */}
      <div className="space-y-3">
        {filteredForecasts.map((forecast) => (
          <div
            key={forecast.id}
            className={`rounded-lg border-2 p-4 transition ${getStatusColor(forecast.forecastStatus)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {forecast.productName}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      {forecast.productSku}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(forecast.forecastStatus)}`}
                  >
                    {getStatusLabel(forecast.forecastStatus)}
                  </span>
                </div>

                {/* Progress and Stats */}
                <div className="space-y-3">
                  {/* Days Remaining Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Days of Stock</span>
                      <span className="font-bold">
                        {forecast.daysRemaining.toFixed(1)} days
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition ${
                          forecast.forecastStatus === "critical"
                            ? "bg-red-500"
                            : forecast.forecastStatus === "warning"
                              ? "bg-orange-500"
                              : forecast.forecastStatus === "adequate"
                                ? "bg-green-500"
                                : "bg-blue-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (forecast.daysRemaining / 30) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Detailed Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-current border-opacity-20">
                    <div>
                      <p className="text-xs font-medium opacity-75">
                        Current Stock
                      </p>
                      <p className="font-bold text-lg">
                        {forecast.currentStock}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium opacity-75">
                        Daily Burn Rate
                      </p>
                      <p className="font-bold text-lg">
                        {forecast.dailyBurnRate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium opacity-75">
                        Reorder Level
                      </p>
                      <p className="font-bold text-lg">
                        {forecast.reorderLevel}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium opacity-75">
                        Recommended Order
                      </p>
                      <p className="font-bold text-lg">
                        {forecast.recommendedOrderQty}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-current border-opacity-20">
                    <div>
                      <p className="opacity-75">Last Restock</p>
                      <p className="font-medium">{forecast.lastRestockDate}</p>
                    </div>
                    <div>
                      <p className="opacity-75">Avg Daily Usage</p>
                      <p className="font-medium">
                        {forecast.avgDailyUsage} units
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {forecast.forecastStatus === "critical" ||
              forecast.forecastStatus === "warning" ? (
                <button className="ml-4 px-4 py-2 bg-current text-white rounded-lg font-medium hover:opacity-90 transition whitespace-nowrap">
                  Order Now
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {filteredForecasts.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {/* Forecast Formula Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h3 className="font-bold text-blue-900 mb-3">How Forecast Works</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Days Remaining:</strong> Current Stock ÷ Daily Burn Rate
          </p>
          <p>
            <strong>Daily Burn Rate:</strong> Average daily usage based on last
            30 days
          </p>
          <p>
            <strong>Recommended Order:</strong> Quantity to reach 45 days of
            stock coverage
          </p>
          <p>
            <strong>Status:</strong> Critical (&lt;2 days), Warning (2-7 days),
            Adequate (7-45 days), Excess (&gt;45 days)
          </p>
        </div>
      </div>
    </div>
  );
}
