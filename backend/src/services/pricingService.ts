import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/db";
import {
  DEFAULT_CUSTOMER_TYPE_CODE,
  type CustomerTypeCode,
} from "../constants/customerType";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export class PricingError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = "PricingError";
    this.statusCode = statusCode;
  }
}

export const getCustomerTypeByCode = async (
  code: CustomerTypeCode,
  db: DatabaseClient = prisma,
) => {
  const customerType = await db.customerType.findUnique({
    where: { code },
    select: { id: true, code: true, name: true, isActive: true },
  });

  if (!customerType || !customerType.isActive) {
    throw new PricingError(`Customer type ${code} is not available`, 503);
  }

  return customerType;
};

export const getDefaultCustomerType = (db: DatabaseClient = prisma) =>
  getCustomerTypeByCode(DEFAULT_CUSTOMER_TYPE_CODE, db);

export const getCustomerTypeForUser = async (
  userId: string,
  db: DatabaseClient = prisma,
) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      customerType: {
        select: { id: true, code: true, name: true, isActive: true },
      },
    },
  });

  if (!user) {
    throw new PricingError("User not found", 404);
  }

  if (!user.customerType || !user.customerType.isActive) {
    throw new PricingError("A valid customer type is required for pricing");
  }

  return user.customerType;
};

export const getPrice = async (
  productId: string,
  customerTypeId: string,
  db: DatabaseClient = prisma,
) => {
  const productPrice = await db.productPrice.findUnique({
    where: {
      productId_customerTypeId: { productId, customerTypeId },
    },
    select: { price: true },
  });

  if (!productPrice) {
    throw new PricingError("No price configured for this product", 409);
  }

  return productPrice.price;
};

export const getPriceForUser = async (
  productId: string,
  userId: string,
  db: DatabaseClient = prisma,
) => {
  const customerType = await getCustomerTypeForUser(userId, db);
  const price = await getPrice(productId, customerType.id, db);

  return { customerType, price };
};

export const calculateLineTotal = (unitPrice: number, quantity: number) => {
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new PricingError("Unit price must be a non-negative number", 400);
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new PricingError("Quantity must be a positive whole number", 400);
  }

  return Math.round(unitPrice * quantity * 100) / 100;
};
