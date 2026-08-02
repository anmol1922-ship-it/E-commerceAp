import { Router } from "express";
import { authenticate, isAdmin } from "../middleware/auth";
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
  exportOrders,
} from "../controllers/adminController";

const router = Router();

const verifyAdmin = isAdmin;

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

// ============ EXPORT ROUTES ============
router.get("/export/orders", authenticate, verifyAdmin, exportOrders);

export default router;
