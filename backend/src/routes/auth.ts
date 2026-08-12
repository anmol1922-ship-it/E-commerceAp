import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  deleteAccount,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import {
  registerValidator,
  loginValidator,
  addressValidator,
} from "../middleware/validators";

const router = Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/address", authenticate, addressValidator, addAddress);
router.delete("/delete-account", authenticate, deleteAccount);

export default router;
