import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import About from "./pages/About";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import InventoryManagement from "./pages/admin/inventory/InventoryManagement";
import StockLedger from "./pages/admin/inventory/StockLedger";
import StockForecast from "./pages/admin/inventory/StockForecast";
import ProfitAnalytics from "./pages/admin/profit/ProfitAnalytics";
import JarReturnManagement from "./pages/admin/jar-returns/JarReturnManagement";
import Reports from "./pages/admin/reports/Reports";

// Legacy admin imports (kept for backward compatibility)
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />

          {/* Legacy Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />

          {/* New Admin Routes with Layout */}
          <Route path="/admin/dashboard" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="inventory/ledger" element={<StockLedger />} />
            <Route path="inventory/forecast" element={<StockForecast />} />
            <Route path="profit" element={<ProfitAnalytics />} />
            <Route path="jar-returns" element={<JarReturnManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
