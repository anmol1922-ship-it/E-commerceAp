import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { loginUser, clearError } from "../store/slices/authSlice";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab] = useState<"login" | "register">("login");

  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/";

  if (user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser({ email, password }));
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
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              activeTab === "login"
                ? "bg-emerald-600 text-white shadow"
                : "text-gray-600"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="flex-1 py-3 rounded-lg font-medium text-gray-600 hover:bg-white transition"
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:bg-gray-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
