import React, { useState } from "react";
import { FiPlus, FiSearch, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface JarReturnRecord {
  id: string;
  customerName: string;
  jarsIssued: number;
  jarsReturned: number;
  pendingJars: number;
  depositAmount: number;
  outstandingDeposit: number;
  returnStatus: "pending" | "partial" | "complete";
  lastReturnDate: string;
  daysOverdue: number;
}

export default function JarReturnManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const jarReturnData: JarReturnRecord[] = [
    {
      id: "JR-001",
      customerName: "Anmol Gupta",
      jarsIssued: 10,
      jarsReturned: 8,
      pendingJars: 2,
      depositAmount: 1000,
      outstandingDeposit: 200,
      returnStatus: "partial",
      lastReturnDate: "2026-05-28",
      daysOverdue: 4,
    },
    {
      id: "JR-002",
      customerName: "Priya Singh",
      jarsIssued: 6,
      jarsReturned: 6,
      pendingJars: 0,
      depositAmount: 600,
      outstandingDeposit: 0,
      returnStatus: "complete",
      lastReturnDate: "2026-05-31",
      daysOverdue: 0,
    },
    {
      id: "JR-003",
      customerName: "Rajesh Kumar",
      jarsIssued: 8,
      jarsReturned: 3,
      pendingJars: 5,
      depositAmount: 800,
      outstandingDeposit: 500,
      returnStatus: "pending",
      lastReturnDate: "2026-05-20",
      daysOverdue: 12,
    },
    {
      id: "JR-004",
      customerName: "Neha Sharma",
      jarsIssued: 5,
      jarsReturned: 4,
      pendingJars: 1,
      depositAmount: 500,
      outstandingDeposit: 100,
      returnStatus: "partial",
      lastReturnDate: "2026-05-30",
      daysOverdue: 2,
    },
    {
      id: "JR-005",
      customerName: "Vikram Patel",
      jarsIssued: 12,
      jarsReturned: 5,
      pendingJars: 7,
      depositAmount: 1200,
      outstandingDeposit: 700,
      returnStatus: "pending",
      lastReturnDate: "2026-05-15",
      daysOverdue: 17,
    },
  ];

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

  const filteredData = jarReturnData.filter((item) => {
    const matchesSearch = item.customerName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || item.returnStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalJarsIssued: jarReturnData.reduce(
      (sum, item) => sum + item.jarsIssued,
      0,
    ),
    totalJarsReturned: jarReturnData.reduce(
      (sum, item) => sum + item.jarsReturned,
      0,
    ),
    totalPendingJars: jarReturnData.reduce(
      (sum, item) => sum + item.pendingJars,
      0,
    ),
    totalOutstandingDeposit: jarReturnData.reduce(
      (sum, item) => sum + item.outstandingDeposit,
      0,
    ),
    overdueCases: jarReturnData.filter((item) => item.daysOverdue > 0).length,
  };

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-700 font-medium">Total Issued</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {stats.totalJarsIssued}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-700 font-medium">Total Returned</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {stats.totalJarsReturned}
          </p>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-sm text-red-700 font-medium">Pending Jars</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {stats.totalPendingJars}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <p className="text-sm text-purple-700 font-medium">
            Outstanding Deposit
          </p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            ₹{stats.totalOutstandingDeposit}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <p className="text-sm text-orange-700 font-medium flex items-center gap-1">
            <FiAlertCircle size={16} />
            Overdue Cases
          </p>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {stats.overdueCases}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400 size-5" />
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
                  Days Overdue
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
                    ₹{item.depositAmount}
                  </td>
                  <td className="py-3 px-6 text-right font-medium text-gray-900">
                    ₹{item.outstandingDeposit}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.returnStatus,
                      )}`}
                    >
                      {item.returnStatus === "complete"
                        ? "✓ Complete"
                        : item.returnStatus === "partial"
                          ? "⚠ Partial"
                          : "⏳ Pending"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {item.daysOverdue > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        <FiAlertCircle size={14} />
                        {item.daysOverdue} days
                      </span>
                    ) : (
                      <span className="text-xs text-green-600">On time</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Return Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Record Jar Return
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option>Select Customer</option>
                  {jarReturnData.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.customerName}
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
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Refunded
                </label>
                <input
                  type="number"
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  placeholder="Add any notes..."
                  rows={3}
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
              <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                Record Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
