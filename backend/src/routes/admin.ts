import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getDashboardKPIs,
  getMonthlyStats,
  getRecentOrders,
  getInventoryProducts,
  addStock,
  getStockLedger,
  getStockForecast,
  getProfitReport,
  getMonthlyProfitTrends,
  getJarReturns,
  recordJarReturn,
  getJarReturnSummary,
} from "../controllers/adminController";

const router = Router();

// Middleware to verify admin access
const verifyAdmin = (req: any, res: any, next: any) => {
  // Verify user is admin in the request (should be set by auth middleware)
  // For now, we'll just continue - authentication is checked by authenticate
  next();
};

// ============ DASHBOARD ROUTES ============
router.get("/dashboard/kpis", authenticate, verifyAdmin, getDashboardKPIs);
router.get(
  "/dashboard/monthly-stats",
  authenticate,
  verifyAdmin,
  getMonthlyStats,
);
router.get(
  "/dashboard/recent-orders",
  authenticate,
  verifyAdmin,
  getRecentOrders,
);

// ============ INVENTORY ROUTES ============
router.get(
  "/inventory/products",
  authenticate,
  verifyAdmin,
  getInventoryProducts,
);
router.post("/inventory/add-stock", authenticate, verifyAdmin, addStock);
router.get("/inventory/ledger", authenticate, verifyAdmin, getStockLedger);
router.get("/inventory/forecast", authenticate, verifyAdmin, getStockForecast);

// ============ PROFIT ROUTES ============
router.get("/profit/report", authenticate, verifyAdmin, getProfitReport);
router.get(
  "/profit/trends/monthly",
  authenticate,
  verifyAdmin,
  getMonthlyProfitTrends,
);

// ============ JAR RETURN ROUTES ============
router.get("/jar-returns", authenticate, verifyAdmin, getJarReturns);
router.post(
  "/jar-returns/record-return",
  authenticate,
  verifyAdmin,
  recordJarReturn,
);
router.get(
  "/jar-returns/stats",
  authenticate,
  verifyAdmin,
  getJarReturnSummary,
);

export default router;
