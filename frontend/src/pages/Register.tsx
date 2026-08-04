import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { registerUser, clearError } from "../store/slices/authSlice";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth,
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(registerUser(form));
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Welcome to Bisleri
        </h1>

        <p className="text-center text-gray-500 text-sm mt-2">
          Water Delivered to Your Doorstep
        </p>
        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 mt-6 mb-6">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 py-3 rounded-lg font-medium text-gray-600 hover:bg-white transition"
          >
            Login
          </button>

          <button className="flex-1 py-3 rounded-lg font-medium bg-emerald-600 text-white shadow">
            Register
          </button>
        </div>
        <div className="flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              Create Account
            </h1>
            <p className="text-gray-500 text-center text-sm mt-1">
              Register for Bisleri delivery in Vasai
            </p>
            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded-lg text-center">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition"
              >
                {loading ? "Creating..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
