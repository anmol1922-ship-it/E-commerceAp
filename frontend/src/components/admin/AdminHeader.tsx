import React from "react";
import { FiMenu, FiLogOut, FiUser, FiBell } from "react-icons/fi";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("bisleri_token");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left: Menu Button */}
      <button
        onClick={onMenuToggle}
        className="text-gray-600 hover:text-gray-900 text-xl"
      >
        <FiMenu />
      </button>

      {/* Center: Title */}
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Right: User Menu */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="text-gray-600 hover:text-gray-900 text-xl relative">
          <FiBell />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-600 text-xl"
          title="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}
