import { Response } from "express";
import { validationResult } from "express-validator";
import Razorpay from "razorpay";
import { Order } from "../models/Order";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { config } from "../config";
import { AuthRequest } from "../middleware/auth";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

const GST_RATE = 0.18;
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 30;

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shippingAddress, deliverySlot, paymentMethod } = req.body;

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Build order items and calculate subtotal
    const items: any[] = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product as any;
      if (!product || !product.isAvailable) {
        return res
          .status(400)
          .json({
            message: `Product ${product?.name || "unknown"} is not available`,
          });
      }
      if (product.stock < cartItem.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });
      subtotal += product.price * cartItem.quantity;
    }

    const gst = Math.round(subtotal * GST_RATE * 100) / 100;
    const deliveryCharge =
      subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const totalAmount =
      Math.round((subtotal + gst + deliveryCharge) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      deliverySlot,
      paymentMethod,
      subtotal,
      gst,
      deliveryCharge,
      totalAmount,
    });

    // Reduce stock
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate((cartItem.product as any)._id, {
        $inc: { stock: -cartItem.quantity, popularity: cartItem.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Create Razorpay order if online payment
    let razorpayOrder = null;
    if (paymentMethod === "razorpay") {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // paise
        currency: "INR",
        receipt: order._id.toString(),
      });
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
    } else {
      order.status = "confirmed";
      await order.save();
    }

    res.status(201).json({
      success: true,
      order,
      razorpayOrder,
      razorpayKeyId: config.razorpayKeyId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpayKeySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.status = "confirmed";
    await order.save();

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all orders
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const filter: any = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, trackingInfo } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(trackingInfo && { trackingInfo }) },
      { new: true },
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalOrders, totalRevenue, pendingOrders, products] =
      await Promise.all([
        Order.countDocuments(),
        Order.aggregate([
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.countDocuments({ status: { $in: ["placed", "confirmed"] } }),
        Product.countDocuments(),
      ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        totalProducts: products,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
