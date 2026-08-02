import React, { useState } from "react";
import { FiDownload, FiFileText, FiCalendar, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

interface Report {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
}

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("excel");
  const [generating, setGenerating] = useState<string | null>(null);

  const reports: Report[] = [
    {
      id: "inventory",
      name: "Inventory Report",
      description:
        "Complete inventory status with stock levels and reorder data",
      icon: <FiFileText size={24} />,
      formats: ["excel", "pdf", "csv"],
    },
    {
      id: "stock-movement",
      name: "Stock Movement Report",
      description: "Track additions, sales, and adjustments for each product",
      icon: <FiFileText size={24} />,
      formats: ["excel", "pdf", "csv"],
    },
    {
      id: "revenue",
      name: "Revenue Report",
      description: "Revenue breakdown by date, product, and payment method",
      icon: <FiFileText size={24} />,
      formats: ["excel", "pdf"],
    },
    {
      id: "profit",
      name: "Profit Report",
      description: "Detailed profit analysis with margin calculations",
      icon: <FiFileText size={24} />,
      formats: ["excel", "pdf"],
    },
    {
      id: "customer",
      name: "Customer Purchase Report",
      description: "Customer-wise purchase history and spending patterns",
      icon: <FiFileText size={24} />,
      formats: ["excel", "pdf", "csv"],
    },
    {
      id: "jar-return",
      name: "Jar Return Report",
      description: "Complete jar return and deposit tracking",
      icon: <FiFileText size={24} />,
      formats: ["excel", "pdf"],
    },
    {
      id: "delivery",
      name: "Delivery Report",
      description: "Order delivery status and pending deliveries",
      icon: <FiFileText size={24} />,
      formats: ["excel", "pdf", "csv"],
    },
    {
      id: "monthly-summary",
      name: "Monthly Summary Report",
      description: "Executive summary with KPIs and trends",
      icon: <FiFileText size={24} />,
      formats: ["excel", "pdf"],
    },
  ];

  const handleGenerateReport = async (reportId: string, format: string) => {
    if (!startDate || !endDate) {
      toast.error("Please select a date range first");
      return;
    }
    const key = `${reportId}-${format}`;
    setGenerating(key);
    try {
      const params: Record<string, string> = {
        startDate,
        endDate,
        format: format === "excel" ? "csv" : format,
      };

      if (format === "json") {
        const { data } = await api.get("/admin/export/orders", { params });
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportId}-${startDate}-${endDate}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const { data } = await api.get("/admin/export/orders", {
          params,
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportId}-${startDate}-${endDate}.${format === "excel" ? "csv" : format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      toast.success(`${reportId} report downloaded`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate report");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">
          Generate and download business reports in multiple formats.
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiCalendar size={20} />
          Select Date Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="text-emerald-600">{report.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {report.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {report.description}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {report.formats.map((format) => (
                <button
                  key={format}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReport(report.id, format);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-emerald-50 border border-gray-200 rounded-lg transition text-sm"
                >
                  <span className="font-medium text-gray-700">
                    {format.toUpperCase()}
                  </span>
                  <FiDownload size={16} className="text-emerald-600" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Recently Generated Reports
        </h3>
        <div className="space-y-3">
          {[
            {
              name: "Monthly Summary - May 2026",
              date: "2026-05-31",
              format: "PDF",
            },
            {
              name: "Profit Report - May 2026",
              date: "2026-05-30",
              format: "Excel",
            },
            {
              name: "Inventory Report",
              date: "2026-05-28",
              format: "CSV",
            },
            {
              name: "Customer Purchase Report",
              date: "2026-05-25",
              format: "Excel",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <FiFileText className="text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                  {item.format}
                </span>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                  <FiDownload size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">Pro Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Use date filters to compare performance between periods</li>
          <li>• Export to Excel for advanced analysis and pivot tables</li>
          <li>• PDF format is ideal for sharing with stakeholders</li>
          <li>• CSV format allows easy import into external systems</li>
          <li>
            • Schedule recurring reports to be automatically generated and
            emailed
          </li>
        </ul>
      </div>
    </div>
  );
}
