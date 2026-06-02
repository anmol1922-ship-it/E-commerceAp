import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiShoppingCart,
  FiUsers,
  FiBox,
  FiTrendingUp,
  FiDollarSign,
  FiArchive,
  FiBarChart2,
  FiRefreshCw,
  FiDownload,
  FiSettings,
  FiChevronDown,
  FiX,
} from "react-icons/fi";
import { useState } from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  {
    label: "Dashboard",
    icon: FiGrid,
    path: "/admin/dashboard",
  },
  {
    label: "Orders",
    icon: FiShoppingCart,
    path: "/admin/orders",
  },
  {
    label: "Customers",
    icon: FiUsers,
    path: "/admin/customers",
  },
  {
    label: "Products",
    icon: FiBox,
    path: "/admin/products",
  },
  {
    label: "Inventory Management",
    icon: FiArchive,
    path: "/admin/dashboard/inventory",
    submenu: [
      { label: "Stock Levels", path: "/admin/dashboard/inventory" },
      { label: "Stock Ledger", path: "/admin/dashboard/inventory/ledger" },
      { label: "Stock Forecast", path: "/admin/dashboard/inventory/forecast" },
    ],
  },
  {
    label: "Revenue Analytics",
    icon: FiTrendingUp,
    path: "/admin/revenue",
  },
  {
    label: "Profit Analytics",
    icon: FiDollarSign,
    path: "/admin/dashboard/profit",
    submenu: [
      { label: "Daily Profit", path: "/admin/dashboard/profit" },
      { label: "Monthly Report", path: "/admin/dashboard/profit" },
    ],
  },
  {
    label: "Jar Return Management",
    icon: FiRefreshCw,
    path: "/admin/dashboard/jar-returns",
  },
  {
    label: "Reports",
    icon: FiDownload,
    path: "/admin/dashboard/reports",
  },
  {
    label: "Settings",
    icon: FiSettings,
    path: "/admin/settings",
  },
];

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative w-64 h-screen bg-gray-900 text-white overflow-y-auto z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Bisleri Admin</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenu === item.label;

            return (
              <div key={item.label}>
                <Link
                  to={item.path}
                  onClick={() => {
                    if (hasSubmenu) {
                      setExpandedMenu(isExpanded ? null : item.label);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg margin-bottom-2 transition ${
                    isActive(item.path)
                      ? "bg-emerald-600 text-white"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <Icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  {hasSubmenu && (
                    <FiChevronDown
                      size={16}
                      className={`transition ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </Link>

                {/* Submenu */}
                {hasSubmenu && isExpanded && (
                  <div className="ml-4 mt-2 space-y-2">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.path}
                        to={subitem.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-2 rounded-lg text-sm transition ${
                          isActive(subitem.path)
                            ? "bg-emerald-600 text-white"
                            : "text-gray-400 hover:bg-gray-800"
                        }`}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-800">
          <p className="text-xs text-gray-400 text-center">
            © 2026 Bisleri Vasai. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
}
