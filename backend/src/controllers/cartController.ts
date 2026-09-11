import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/auth";
import {
  getCustomerTypeForUser,
  getPrice,
  PricingError,
} from "../services/pricingService";

const getCartWithPrices = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  const customerType = await getCustomerTypeForUser(userId);
  const items = await Promise.all(
    cart.items.map(async (item) => ({
      ...item,
      product: {
        ...item.product,
        price: await getPrice(item.productId, customerType.id),
      },
    })),
  );

  return { ...cart, items };
};

const sendPricingError = (error: unknown, res: Response) => {
  if (error instanceof PricingError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  return null;
};

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await getCartWithPrices(req.user.id);
    res.json({ success: true, cart });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const parsedProductId = String(productId ?? "");
    const parsedQuantity = Number(quantity);

    if (
      !parsedProductId ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        message: "A product and positive whole-number quantity are required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parsedProductId },
    });
    if (!product || !product.isAvailable) {
      return res.status(404).json({ message: "Product not available" });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: { include: { product: true } } },
      });
    }

    const existingItem = cart.items.find(
      (item: any) => item.productId === parsedProductId,
    );
    const nextQuantity = (existingItem?.quantity ?? 0) + parsedQuantity;
    if (nextQuantity > product.stock) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parsedProductId,
          quantity: parsedQuantity,
        },
      });
    }

    const updatedCart = await getCartWithPrices(req.user.id);

    res.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const parsedProductId = String(productId ?? "");
    const parsedQuantity = Number(quantity);

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (cartItem: any) => cartItem.productId === parsedProductId,
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (!Number.isInteger(parsedQuantity)) {
      return res
        .status(400)
        .json({ message: "Quantity must be a whole number" });
    }

    if (parsedQuantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      const product = await prisma.product.findUnique({
        where: { id: parsedProductId },
      });
      if (!product || !product.isAvailable) {
        return res.status(404).json({ message: "Product not available" });
      }
      if (parsedQuantity > product.stock) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: parsedQuantity },
      });
    }

    const updatedCart = await getCartWithPrices(req.user.id);

    res.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((item: any) => item.productId === productId);
    if (item) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    }

    const updatedCart = await getCartWithPrices(req.user.id);

    res.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    const updatedCart = await getCartWithPrices(req.user.id);
    res.json({ success: true, message: "Cart cleared", cart: updatedCart });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    res.status(500).json({ message: error.message });
  }
};
