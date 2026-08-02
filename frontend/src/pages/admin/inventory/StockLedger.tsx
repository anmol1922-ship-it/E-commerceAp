import React, { useState, useEffect, useCallback } from "react";
import {
  FiChevronDown,
  FiSearch,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";
import api from "../../../api/axios";

interface StockLedgerEntry {
  id: string;
  date: string;
  type: string;
  productName: string;
  quantity: number;
  unitCost: number | null;
  totalCost: number | null;
  reference: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function StockLedger() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [ledgerData, setLedgerData] = useState<StockLedgerEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          page: page.toString(),
          limit: "20",
        };
        if (filterType !== "all") params.type = filterType;

        const { data } = await api.get("/admin/inventory/ledger", { params });
        if (data.success) {
          setLedgerData(data.data);
          setPagination(data.pagination);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load stock ledger");
      } finally {
        setLoading(false);
      }
    },
    [filterType],
  );

  useEffect(() => {
    fetchLedger(1);
  }, [fetchLedger]);

  const filteredData = searchTerm
    ? ledgerData.filter(
        (entry) =>
          entry.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.reference?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : ledgerData;

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      purchase: "bg-green-100 text-green-700",
      sale: "bg-blue-100 text-blue-700",
      return: "bg-yellow-100 text-yellow-700",
      adjustment: "bg-purple-100 text-purple-700",
      damage: "bg-red-100 text-red-700",
      sample: "bg-indigo-100 text-indigo-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: "Purchase",
      sale: "Sale",
      return: "Return",
      adjustment: "Adjustment",
      damage: "Damage",
      sample: "Sample",
    };
    return labels[type] || type;
  };

  const getTransactionIcon = (type: string) => {
    if (["sale", "damage", "sample"].includes(type)) {
      return <FiArrowDown size={16} />;
    }
    return <FiArrowUp size={16} />;
  };

  const handleExport = async () => {
    try {
      const params: Record<string, string> = { format: "csv" };
      if (filterType !== "all") params.type = filterType;
      const { data } = await api.get("/admin/export/orders", {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "stock-ledger.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: export current data as CSV
      const csv =
        "Date,Type,Product,Quantity,Unit Cost,Total Cost,Reference\n" +
        filteredData
          .map(
            (e) =>
              `${new Date(e.date).toLocaleDateString()},${e.type},${e.productName},${e.quantity},${e.unitCost || ""},${e.totalCost || ""},${e.reference || ""}`,
          )
          .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stock-ledger.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading && ledgerData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-gray-500">Loading stock ledger...</span>
      </div>
    );
  }

  if (error && ledgerData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <FiAlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => fetchLedger(1)}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stock Ledger</h1>
        <p className="text-gray-500 mt-1">
          Complete audit trail of all stock movements and transactions.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by product or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-gray-700 font-medium">
                {filterType === "all"
                  ? "All Transactions"
                  : getTransactionTypeLabel(filterType)}
              </span>
              <FiChevronDown size={18} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {[
                  "all",
                  "purchase",
                  "sale",
                  "return",
                  "adjustment",
                  "damage",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setShowFilterMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition border-b last:border-b-0 capitalize"
                  >
                    {type === "all"
                      ? "All Transactions"
                      : getTransactionTypeLabel(type)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            <FiDownload size={18} />
            Export Ledger
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded font-medium text-xs ${getTransactionTypeColor(entry.type)}`}
                    >
                      {getTransactionIcon(entry.type)}
                      {getTransactionTypeLabel(entry.type)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {entry.productName}
                  </td>
                  <td className="px-6 py-3 text-sm text-center">
                    <span
                      className={
                        ["purchase", "return"].includes(entry.type)
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {["purchase", "return"].includes(entry.type) ? "+" : "-"}
                      {entry.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-center text-gray-600">
                    {entry.unitCost != null ? `₹${entry.unitCost}` : "-"}
                  </td>
                  <td className="px-6 py-3 text-sm text-center font-medium text-gray-900">
                    {entry.totalCost != null ? `₹${entry.totalCost}` : "-"}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 font-mono text-xs">
                    {entry.reference || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            Showing page <span className="font-bold">{pagination.page}</span> of{" "}
            <span className="font-bold">{pagination.pages}</span> (
            {pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLedger(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchLedger(pageNum)}
                  className={`px-3 py-2 rounded-lg transition ${
                    pagination.page === pageNum
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => fetchLedger(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
