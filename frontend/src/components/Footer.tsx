import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-white text-lg font-bold mb-3">Bisleri Vasai</h3>
          <p className="text-sm leading-relaxed">
            Premium mineral water delivery for homes and offices in Vasai,
            Maharashtra.
          </p>
        </div>
        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/products"
                className="hover:text-emerald-400 transition"
              >
                Products
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-emerald-400 transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-emerald-400 transition">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>Phone: +91 98765 43210</li>
            <li>Email: order@bisleri-vasai.com</li>
            <li>Vasai West, Maharashtra 401202</li>
          </ul>
        </div>
        {/* Delivery */}
        <div>
          <h4 className="text-white font-semibold mb-3">Delivery Info</h4>
          <p className="text-sm leading-relaxed">
            Free delivery on orders above ₹500. Same-day delivery available for
            early orders in Vasai area.
          </p>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Bisleri Water Delivery, Vasai. All rights
        reserved.
      </div>
    </footer>
  );
}
