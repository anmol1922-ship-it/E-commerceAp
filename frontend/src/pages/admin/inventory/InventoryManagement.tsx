import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiDownload, FiEdit2 } from "react-icons/fi";
import api from "../../../api/axios";

interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  openingStock: number;
  stockAdded: number;
  stockSold: number;
  currentStock: number;
  reorderLevel: number;
  status: "healthy" | "low" | "out";
  lastUpdated: string;
  costPrice: number;
  supplier?: string;
}

export default function InventoryManagement() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/inventory/products", {
          params: { limit: 100 },
        });

        const products = response.data?.data ?? [];

        const mappedData: InventoryItem[] = products.map((item: any) => ({
          id: item.id,
          sku: item.slug?.toUpperCase() ?? item.id,
          productName: item.name,
          openingStock: item.stock ?? 0,
          stockAdded: 0,
          stockSold: 0,
          currentStock: item.stock ?? 0,
          reorderLevel: item.reorderLevel ?? 0,
          status: item.status ?? "healthy",
          lastUpdated: "—",
          costPrice: item.costPrice ?? 0,
          supplier: item.supplier ?? "—",
        }));

        setInventoryData(mappedData);
      } catch (err) {
        console.error(err);
        setError("Unable to load inventory data from the database.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-700 border-green-300";
      case "low":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "out":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "healthy":
        return "✓ Healthy";
      case "low":
        return "⚠ Low Stock";
      case "out":
        return "✕ Out of Stock";
      default:
        return status;
    }
  };

  const totalStockValue = useMemo(
    () =>
      inventoryData.reduce(
        (sum, item) => sum + item.currentStock * item.costPrice,
        0,
      ),
    [inventoryData],
  );

  const totalUnits = useMemo(
    () => inventoryData.reduce((sum, item) => sum + item.currentStock, 0),
    [inventoryData],
  );

  const lowStockItems = useMemo(
    () => inventoryData.filter((item) => item.status === "low").length,
    [inventoryData],
  );

  const outOfStockItems = useMemo(
    () => inventoryData.filter((item) => item.status === "out").length,
    [inventoryData],
  );

  const filteredData = useMemo(
    () =>
      inventoryData.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [inventoryData, searchTerm],
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-gray-500 mt-1">
            Track stock levels and manage inventory across all products.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
            <FiDownload size={18} />
            Export
          </button>
          <button
            onClick={() => setShowAddStockModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <FiPlus size={18} />
            Add Stock
          </button>
        </div>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400 size-5" />
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Stock Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalStockValue)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Units</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalUnits}</p>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <p className="text-sm text-orange-700 font-medium">Low Stock Items</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {lowStockItems}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-sm text-red-700 font-medium">Out of Stock</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {outOfStockItems}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-gray-600">Loading inventory data...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">
                    Product
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">
                    SKU
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700">
                    Opening Stock
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700">
                    Added
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700">
                    Sold
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700">
                    Current
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700">
                    Reorder Level
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-gray-500">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-6 font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="py-3 px-6 text-gray-600">{item.sku}</td>
                      <td className="py-3 px-6 text-center text-gray-600">
                        {item.openingStock}
                      </td>
                      <td className="py-3 px-6 text-center text-green-600 font-medium">
                        +{item.stockAdded}
                      </td>
                      <td className="py-3 px-6 text-center text-red-600 font-medium">
                        -{item.stockSold}
                      </td>
                      <td className="py-3 px-6 text-center font-bold text-gray-900">
                        {item.currentStock}
                      </td>
                      <td className="py-3 px-6 text-center text-gray-600">
                        {item.reorderLevel}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            item.status,
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => {
                            setSelectedProduct(item.id);
                            setShowAddStockModal(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Add Stock</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  value={selectedProduct ?? ""}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Product</option>
                  {inventoryData.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Added
                </label>
                <input
                  type="number"
                  placeholder="e.g., 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Cost (per unit)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 45"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bisleri Corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., INV-2026-001"
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
                onClick={() => setShowAddStockModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
