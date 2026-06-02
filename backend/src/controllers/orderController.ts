import { Response } from "express";
import { validationResult } from "express-validator";
import Razorpay from "razorpay";
import { prisma } from "../config/db";
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

    const {
      shippingAddress,
      deliverySlot,
      paymentMethod,
      items: requestItems,
    } = req.body;

    // Get stored cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    const useRequestItems = !cart || cart.items.length === 0;

    if (useRequestItems && (!requestItems || requestItems.length === 0)) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate products and calculate subtotal
    const items: any[] = [];
    let subtotal = 0;

    if (useRequestItems) {
      for (const requestItem of requestItems) {
        const product = await prisma.product.findUnique({
          where: { id: requestItem.product },
        });

        if (!product || !product.isAvailable) {
          return res.status(400).json({
            message: `Product ${product?.name || requestItem.product} is not available`,
          });
        }
        if (product.stock < requestItem.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}`,
          });
        }

        items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: requestItem.quantity,
        });
        subtotal += Number(product.price) * requestItem.quantity;
      }
    } else {
      for (const cartItem of cart.items) {
        const product = cartItem.product;
        if (!product || !product.isAvailable) {
          return res.status(400).json({
            message: `Product ${product?.name || "unknown"} is not available`,
          });
        }
        if (product.stock < cartItem.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}`,
          });
        }

        items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: cartItem.quantity,
        });
        subtotal += Number(product.price) * cartItem.quantity;
      }
    }

    const gst = Math.round(subtotal * GST_RATE * 100) / 100;
    const deliveryCharge =
      subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const totalAmount =
      Math.round((subtotal + gst + deliveryCharge) * 100) / 100;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          paymentMethod: paymentMethod as "razorpay" | "cod",
          shippingAddress: JSON.stringify(shippingAddress),
          subtotal,
          gst,
          deliveryCharge,
          totalAmount,
          deliverySlot,
          paymentStatus: paymentMethod === "razorpay" ? "pending" : "pod",
          status: paymentMethod === "razorpay" ? "placed" : "confirmed",
        },
      });

      // Create order items
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            price: item.price,
            quantity: item.quantity,
          },
        });

        // Reduce stock and increase popularity
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            popularity: { increment: item.quantity },
          },
        });
      }

      // Clear cart items if cart exists
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return newOrder;
    });

    // Create Razorpay order if online payment
    let razorpayOrder = null;
    if (paymentMethod === "razorpay") {
      console.log("Creating Razorpay order with config:", {
        hasKeyId: !!config.razorpayKeyId,
        hasKeySecret: !!config.razorpayKeySecret,
      });

      if (!config.razorpayKeyId || !config.razorpayKeySecret) {
        console.error("Missing Razorpay credentials");
        return res.status(500).json({
          message: "Payment gateway not configured. Please try COD.",
        });
      }

      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order.id.toString(),
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id },
      });
    }

    const response = {
      success: true,
      order,
      razorpayOrder,
      razorpayKeyId: config.razorpayKeyId,
    };

    console.log("Sending response:", {
      hasRazorpayKeyId: !!response.razorpayKeyId,
      razorpayKeyId: response.razorpayKeyId,
    });

    res.status(201).json(response);
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

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "paid",
        razorpayPaymentId: razorpay_payment_id,
        status: "confirmed",
      },
    });

    res.json({ success: true, order: updatedOrder });
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
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
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
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: { items: { include: { product: true } } },
    });

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

    const where: any = {};
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
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

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: status as
          | "placed"
          | "confirmed"
          | "dispatched"
          | "delivered"
          | "cancelled",
        ...(trackingInfo && { trackingInfo }),
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Admin: dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalOrders, pendingOrders, totalProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: { in: ["placed", "confirmed"] } },
      }),
      prisma.product.count(),
    ]);

    // Calculate total revenue
    const revenueResult = await prisma.order.aggregate({
      where: { paymentStatus: "paid" },
      _sum: { totalAmount: true },
    });

    const totalRevenue = revenueResult._sum?.totalAmount || 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: Number(totalRevenue),
        pendingOrders,
        totalProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
