import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} from "../controllers/orderController";
import { authenticate, isAdmin } from "../middleware/auth";
import { orderValidator } from "../middleware/validators";

const router = Router();

router.post("/", authenticate, orderValidator, createOrder);
router.post("/verify-payment", authenticate, verifyPayment);
router.get("/my-orders", authenticate, getMyOrders);
router.get("/my-orders/:id", authenticate, getOrderById);

// Admin routes
router.get("/admin/all", authenticate, isAdmin, getAllOrders);
router.put("/admin/:id/status", authenticate, isAdmin, updateOrderStatus);
router.get("/admin/dashboard", authenticate, isAdmin, getDashboardStats);

export default router;
