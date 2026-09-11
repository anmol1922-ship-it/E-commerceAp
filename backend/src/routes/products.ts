import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import {
  authenticate,
  isAdmin,
  optionalAuthenticate,
} from "../middleware/auth";

const router = Router();

router.get("/", optionalAuthenticate, getProducts);
router.get("/slug/:slug", optionalAuthenticate, getProductBySlug);
router.get("/:id", optionalAuthenticate, getProductById);

// Admin routes
router.post("/", authenticate, isAdmin, createProduct);
router.put("/:id", authenticate, isAdmin, updateProduct);
router.delete("/:id", authenticate, isAdmin, deleteProduct);

export default router;
