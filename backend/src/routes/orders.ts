import { Router, Response } from "express";
import Order from "../models/Order";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Get user orders
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.userId }).populate(
      "items.productId",
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Create order
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;

    const newOrder = new Order({
      userId: req.userId,
      items,
      totalAmount,
      shippingAddress,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order" });
  }
});

// Get order by ID
router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.productId",
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order" });
  }
});

export default router;
