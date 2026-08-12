import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 */}
        <div className="text-8xl font-bold text-emerald-600 mb-4">404</div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Page Not Found
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          Sorry, the page you are looking for doesn't exist or may have been
          moved. Please check the URL or return to the home page.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2
                       bg-emerald-600 text-white
                       px-5 py-2.5 rounded-lg
                       hover:bg-emerald-700 transition"
          >
            <FiHome size={18} />
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2
                       border border-gray-300
                       text-gray-700
                       px-5 py-2.5 rounded-lg
                       hover:bg-gray-100 transition"
          >
            <FiArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
