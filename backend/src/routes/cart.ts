import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getCart);
router.post("/add", authenticate, addToCart);
router.put("/update", authenticate, updateCartItem);
router.delete("/item/:productId", authenticate, removeFromCart);
router.delete("/clear", authenticate, clearCart);

export default router;
