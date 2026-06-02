import React, { useState } from "react";
import {
  FiChevronDown,
  FiSearch,
  FiDownload,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

interface StockLedgerEntry {
  id: string;
  date: string;
  transactionType:
    | "purchase"
    | "sale"
    | "return"
    | "adjustment"
    | "damage"
    | "sample";
  productName: string;
  productSku: string;
  openingQty: number;
  added: number;
  sold: number;
  returned: number;
  closingQty: number;
  reference: string;
  supplier?: string;
  notes?: string;
}

export default function StockLedger() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const mockData: StockLedgerEntry[] = [
    {
      id: "1",
      date: "2026-06-15",
      transactionType: "purchase",
      productName: "20L Water Jar",
      productSku: "W20L-001",
      openingQty: 500,
      added: 200,
      sold: 0,
      returned: 0,
      closingQty: 700,
      reference: "PO-2026-0892",
      supplier: "Fresh Waters Ltd",
      notes: "Bulk purchase from supplier",
    },
    {
      id: "2",
      date: "2026-06-15",
      transactionType: "sale",
      productName: "10L Water Jar",
      productSku: "W10L-001",
      openingQty: 320,
      added: 0,
      sold: 45,
      returned: 0,
      closingQty: 275,
      reference: "ORD-2026-12854",
      notes: "Daily sales - Multiple orders",
    },
    {
      id: "3",
      date: "2026-06-14",
      transactionType: "return",
      productName: "20L Water Jar",
      productSku: "W20L-001",
      openingQty: 650,
      added: 0,
      sold: 0,
      returned: 50,
      closingQty: 700,
      reference: "RET-2026-564",
      notes: "Customer returns - Defective jars",
    },
    {
      id: "4",
      date: "2026-06-14",
      transactionType: "adjustment",
      productName: "5L Bottle",
      productSku: "W5L-002",
      openingQty: 450,
      added: 0,
      sold: 0,
      returned: 0,
      closingQty: 448,
      reference: "ADJ-2026-203",
      notes: "Stock reconciliation - Physical count",
    },
    {
      id: "5",
      date: "2026-06-13",
      transactionType: "damage",
      productName: "20L Water Jar",
      productSku: "W20L-001",
      openingQty: 655,
      added: 0,
      sold: 0,
      returned: 0,
      closingQty: 650,
      reference: "DMG-2026-124",
      notes: "Damaged during storage - Warehouse inspection",
    },
    {
      id: "6",
      date: "2026-06-13",
      transactionType: "sale",
      productName: "20L Water Jar",
      productSku: "W20L-001",
      openingQty: 705,
      added: 0,
      sold: 50,
      returned: 0,
      closingQty: 655,
      reference: "ORD-2026-12840",
      notes: "Daily sales - B2B orders",
    },
    {
      id: "7",
      date: "2026-06-12",
      transactionType: "sample",
      productName: "20L Water Jar",
      productSku: "W20L-001",
      openingQty: 720,
      added: 0,
      sold: 0,
      returned: 0,
      closingQty: 705,
      reference: "SAM-2026-89",
      notes: "Product samples - Trade show",
    },
  ];

  const filteredData = mockData.filter((entry) => {
    const matchesSearch =
      entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" || entry.transactionType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTransactionTypeColor = (
    type: StockLedgerEntry["transactionType"],
  ) => {
    const colors = {
      purchase: "bg-green-100 text-green-700",
      sale: "bg-blue-100 text-blue-700",
      return: "bg-yellow-100 text-yellow-700",
      adjustment: "bg-purple-100 text-purple-700",
      damage: "bg-red-100 text-red-700",
      sample: "bg-indigo-100 text-indigo-700",
    };
    return colors[type];
  };

  const getTransactionTypeLabel = (
    type: StockLedgerEntry["transactionType"],
  ) => {
    const labels = {
      purchase: "Purchase",
      sale: "Sale",
      return: "Return",
      adjustment: "Adjustment",
      damage: "Damage",
      sample: "Sample",
    };
    return labels[type];
  };

  const getTransactionIcon = (type: StockLedgerEntry["transactionType"]) => {
    if (type === "sale" || type === "damage" || type === "sample") {
      return <FiArrowDown size={16} />;
    }
    return <FiArrowUp size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stock Ledger</h1>
        <p className="text-gray-500 mt-1">
          Complete audit trail of all stock movements and transactions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Purchases Today",
            value: "1,250 units",
            subtext: "from 3 transactions",
          },
          {
            label: "Total Sales Today",
            value: "645 units",
            subtext: "from 18 transactions",
          },
          {
            label: "Returns Today",
            value: "50 units",
            subtext: "from 1 transaction",
          },
          {
            label: "Stock Adjustments",
            value: "2 units",
            subtext: "net adjustment",
          },
        ].map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-600 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {card.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
          </div>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by product, SKU, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-gray-700 font-medium">
                {filterType === "all"
                  ? "All Transactions"
                  : getTransactionTypeLabel(
                      filterType as StockLedgerEntry["transactionType"],
                    )}
              </span>
              <FiChevronDown size={18} />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {["all", "purchase", "sale", "return", "adjustment"].map(
                  (type) => (
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
                        : getTransactionTypeLabel(
                            type as StockLedgerEntry["transactionType"],
                          )}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">
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
                  Opening
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Added
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Sold
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  Closing
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((entry) => (
                <React.Fragment key={entry.id}>
                  <tr
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() =>
                      setExpandedRow(expandedRow === entry.id ? null : entry.id)
                    }
                  >
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {entry.date}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded font-medium text-xs ${getTransactionTypeColor(entry.transactionType)}`}
                      >
                        {getTransactionIcon(entry.transactionType)}
                        {getTransactionTypeLabel(entry.transactionType)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.productSku}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-center text-gray-900">
                      {entry.openingQty}
                    </td>
                    <td className="px-6 py-3 text-sm text-center">
                      {entry.added > 0 ? (
                        <span className="text-green-600 font-medium">
                          +{entry.added}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-center">
                      {entry.sold > 0 ? (
                        <span className="text-red-600 font-medium">
                          -{entry.sold}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-center font-bold text-gray-900">
                      {entry.closingQty}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 font-mono text-xs">
                      {entry.reference}
                    </td>
                  </tr>
                  {expandedRow === entry.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-700 uppercase">
                              Notes
                            </p>
                            <p className="text-sm text-gray-900 mt-1">
                              {entry.notes || "N/A"}
                            </p>
                          </div>
                          {entry.supplier && (
                            <div>
                              <p className="text-xs font-bold text-gray-700 uppercase">
                                Supplier
                              </p>
                              <p className="text-sm text-gray-900 mt-1">
                                {entry.supplier}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-gray-700 uppercase">
                              Quantity Change
                            </p>
                            <p className="text-sm text-gray-900 mt-1">
                              {entry.closingQty - entry.openingQty > 0
                                ? "+"
                                : ""}
                              {entry.closingQty - entry.openingQty} units
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-bold">{filteredData.length}</span> of{" "}
          <span className="font-bold">{mockData.length}</span> transactions
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            1
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            2
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
