import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

interface JarReturnRecord {
  id: string;
  customerName: string;
  jarsIssued: number;
  jarsReturned: number;
  pendingJars: number;
  deposit: number;
  outstanding: number;
  status: string;
  lastReturn: string | null;
}

interface JarReturnSummary {
  totalRecords: number;
  totalJarsIssued: number;
  totalJarsReturned: number;
  totalDeposit: number;
  totalOutstanding: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function JarReturnManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [jarReturns, setJarReturns] = useState<JarReturnRecord[]>([]);
  const [summary, setSummary] = useState<JarReturnSummary | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal form state
  const [returnForm, setReturnForm] = useState({
    jarReturnId: "",
    quantityReturned: 0,
    depositRefunded: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          page: page.toString(),
          limit: "20",
        };
        if (filterStatus !== "all") params.status = filterStatus;

        const [returnsRes, summaryRes] = await Promise.all([
          api.get("/admin/jar-returns", { params }),
          api.get("/admin/jar-returns/stats"),
        ]);

        if (returnsRes.data.success) {
          setJarReturns(returnsRes.data.data);
          setPagination(returnsRes.data.pagination);
        }
        if (summaryRes.data.success) {
          setSummary(summaryRes.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load jar returns");
      } finally {
        setLoading(false);
      }
    },
    [filterStatus],
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleRecordReturn = async () => {
    if (!returnForm.jarReturnId || returnForm.quantityReturned <= 0) {
      toast.error("Please select a record and enter quantity");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/admin/jar-returns/record-return", {
        jarReturnId: returnForm.jarReturnId,
        quantityReturned: returnForm.quantityReturned,
        depositRefunded: returnForm.depositRefunded,
      });
      if (data.success) {
        toast.success("Jar return recorded successfully");
        setShowAddModal(false);
        setReturnForm({
          jarReturnId: "",
          quantityReturned: 0,
          depositRefunded: 0,
        });
        fetchData(pagination.page);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record return");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-700";
      case "partial":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredData = searchTerm
    ? jarReturns.filter((item) =>
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : jarReturns;

  if (loading && jarReturns.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiLoader className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-gray-500">Loading jar returns...</span>
      </div>
    );
  }

  if (error && jarReturns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <FiAlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => fetchData(1)}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Jar Return Management
          </h1>
          <p className="text-gray-500 mt-1">
            Track returnable jars and customer deposits.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <FiPlus size={18} />
          Record Return
        </button>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-sm text-blue-700 font-medium">Total Issued</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {summary.totalJarsIssued}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-sm text-green-700 font-medium">Total Returned</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {summary.totalJarsReturned}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-sm text-red-700 font-medium">Pending Jars</p>
            <p className="text-2xl font-bold text-red-900 mt-1">
              {summary.totalJarsIssued - summary.totalJarsReturned}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <p className="text-sm text-purple-700 font-medium">Total Deposit</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              ₹{summary.totalDeposit}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
            <p className="text-sm text-orange-700 font-medium">Outstanding</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              ₹{summary.totalOutstanding}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="complete">Complete</option>
          <option value="partial">Partial</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Jar Returns Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Customer
                </th>
                <th className="text-center py-3 px-6 font-medium text-gray-700">
                  Issued
                </th>
                <th className="text-center py-3 px-6 font-medium text-gray-700">
                  Returned
                </th>
                <th className="text-center py-3 px-6 font-medium text-gray-700">
                  Pending
                </th>
                <th className="text-right py-3 px-6 font-medium text-gray-700">
                  Deposit
                </th>
                <th className="text-right py-3 px-6 font-medium text-gray-700">
                  Outstanding
                </th>
                <th className="text-center py-3 px-6 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-center py-3 px-6 font-medium text-gray-700">
                  Last Return
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-6 font-medium text-gray-900">
                    {item.customerName}
                  </td>
                  <td className="py-3 px-6 text-center text-gray-600">
                    {item.jarsIssued}
                  </td>
                  <td className="py-3 px-6 text-center text-green-600 font-medium">
                    {item.jarsReturned}
                  </td>
                  <td className="py-3 px-6 text-center font-bold text-red-600">
                    {item.pendingJars}
                  </td>
                  <td className="py-3 px-6 text-right text-gray-600">
                    ₹{item.deposit}
                  </td>
                  <td className="py-3 px-6 text-right font-medium text-gray-900">
                    ₹{item.outstanding}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {item.status === "complete"
                        ? "✓ Complete"
                        : item.status === "partial"
                          ? "⚠ Partial"
                          : "⏳ Pending"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center text-gray-600 text-xs">
                    {item.lastReturn
                      ? new Date(item.lastReturn).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No jar return records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
            total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchData(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Record Return Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Record Jar Return
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Record
                </label>
                <select
                  value={returnForm.jarReturnId}
                  onChange={(e) =>
                    setReturnForm({
                      ...returnForm,
                      jarReturnId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Customer</option>
                  {jarReturns
                    .filter((item) => item.status !== "complete")
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.customerName} (Pending: {item.pendingJars})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jars Returned
                </label>
                <input
                  type="number"
                  min="1"
                  value={returnForm.quantityReturned || ""}
                  onChange={(e) =>
                    setReturnForm({
                      ...returnForm,
                      quantityReturned: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Refunded (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={returnForm.depositRefunded || ""}
                  onChange={(e) =>
                    setReturnForm({
                      ...returnForm,
                      depositRefunded: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordReturn}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Record Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
