import React, { useState, useEffect } from "react";
import {
  FiTrendingDown,
  FiAlertTriangle,
  FiSearch,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../../../api/axios";

interface ForecastItem {
  id: string;
  productName: string;
  currentStock: number;
  dailyBurnRate: number;
  daysRemaining: number;
  reorderLevel: number;
  forecastStatus: "critical" | "warning" | "adequate" | "excess";
}

export default function StockForecast() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("daysRemaining");
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecasts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/admin/inventory/forecast");
      if (data.success) {
        setForecasts(data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load stock forecast");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      critical: "text-red-600 bg-red-50 border-red-200",
      warning: "text-orange-600 bg-orange-50 border-orange-200",
      adequate: "text-green-600 bg-green-50 border-green-200",
      excess: "text-blue-600 bg-blue-50 border-blue-200",
    };
    return colors[status] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-700",
      warning: "bg-orange-100 text-orange-700",
      adequate: "bg-green-100 text-green-700",
      excess: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      critical: "Critical - Order Now",
      warning: "Warning - Order Soon",
      adequate: "Adequate Stock",
      excess: "Excess Stock",
    };
    return labels[status] || status;
  };

  const filteredForecasts = forecasts
    .filter((f) =>
      f.productName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "daysRemaining") return a.daysRemaining - b.daysRemaining;
      if (sortBy === "status") {
        const order: Record<string, number> = {
          critical: 0,
          warning: 1,
          adequate: 2,
          excess: 3,
        };
        return (order[a.forecastStatus] ?? 4) - (order[b.forecastStatus] ?? 4);
      }
      return 0;
    });

  const criticalCount = forecasts.filter(
    (f) => f.forecastStatus === "critical",
  ).length;
  const warningCount = forecasts.filter(
    (f) => f.forecastStatus === "warning",
  ).length;
  const avgDaysRemaining =
    forecasts.length > 0
      ? (
          forecasts.reduce((sum, f) => sum + f.daysRemaining, 0) /
          forecasts.length
        ).toFixed(1)
      : "0";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-gray-500">Loading stock forecast...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <FiAlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchForecasts}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Forecast</h1>
          <p className="text-gray-500 mt-1">
            Predictive stock analysis with automatic reorder recommendations.
          </p>
        </div>
        <button
          onClick={fetchForecasts}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>
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
              {criticalCount + warningCount} products need immediate attention.
              Consider placing orders to avoid stockouts.
            </p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 font-medium">Critical Stock</p>
          <p className="text-2xl font-bold mt-2 text-red-700">
            {criticalCount}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 font-medium">Warning Stock</p>
          <p className="text-2xl font-bold mt-2 text-orange-700">
            {warningCount}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 font-medium">
            Avg Days Remaining
          </p>
          <p className="text-2xl font-bold mt-2 text-blue-700">
            {avgDaysRemaining} days
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 font-medium">Total Products</p>
          <p className="text-2xl font-bold mt-2 text-gray-700">
            {forecasts.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
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

      {/* Forecast Cards */}
      {filteredForecasts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FiTrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No forecast data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredForecasts.map((forecast) => (
            <div
              key={forecast.id}
              className={`rounded-lg border-2 p-4 transition ${getStatusColor(forecast.forecastStatus)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-gray-900">
                      {forecast.productName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(forecast.forecastStatus)}`}
                    >
                      {getStatusLabel(forecast.forecastStatus)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">
                          Days of Stock
                        </span>
                        <span className="font-bold">
                          {forecast.daysRemaining > 900
                            ? "∞"
                            : `${forecast.daysRemaining} days`}
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
                            width: `${Math.min((forecast.daysRemaining / 30) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Current Stock</p>
                        <p className="font-bold text-gray-900">
                          {forecast.currentStock} units
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Daily Usage</p>
                        <p className="font-bold text-gray-900">
                          {forecast.dailyBurnRate} units/day
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reorder Level</p>
                        <p className="font-bold text-gray-900">
                          {forecast.reorderLevel} units
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
