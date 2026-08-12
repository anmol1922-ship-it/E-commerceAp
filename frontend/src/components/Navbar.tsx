import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { logout } from "../store/slices/authSlice";
import { FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

export default function Navbar() {
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = items.reduce((c, i) => c + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-emerald-700">Bisleri</span>
          <span className="hidden sm:inline text-sm text-gray-500">
            Vasai Delivery
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-emerald-600 transition">
            Home
          </Link>
          <Link to="/products" className="hover:text-emerald-600 transition">
            Products
          </Link>
          <Link to="/about" className="hover:text-emerald-600 transition">
            About
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="hover:text-emerald-600 transition">
              Admin
            </Link>
          )}
          {/* Privacy Policy */}
          <Link
            to="/privacy-policy"
            className="hover:text-emerald-600 transition"
          >
            Privacy
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600"
              >
                <FiUser size={18} /> {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={() => dispatch(logout())}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-block text-sm font-medium text-emerald-700 border border-emerald-600 rounded-full px-4 py-1.5 hover:bg-emerald-50 transition"
            >
              Login
            </Link>
          )}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-2 shadow-lg">
          <Link
            to="/"
            className="block py-2 text-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="block py-2 text-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
          )}
          <Link
            to="/products"
            className="block py-2 text-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/about"
            className="block py-2 text-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          {/* Privacy Policy */}
          <Link
            to="/privacy-policy"
            className="block py-2 text-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            Privacy Policy
          </Link>
          {user ? (
            <>
              <Link
                to="/profile"
                className="block py-2 text-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              {/* Delete Account */}
              <Link
                to="/delete-account"
                className="block py-2 text-red-500"
                onClick={() => setMenuOpen(false)}
              >
                Delete Account
              </Link>

              <button
                onClick={() => {
                  dispatch(logout());
                  setMenuOpen(false);
                }}
                className="block py-2 text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block py-2 text-emerald-700 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
