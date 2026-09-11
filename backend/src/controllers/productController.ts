import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/auth";
import {
  CUSTOMER_TYPE_CODES,
  type CustomerTypeCode,
} from "../constants/customerType";
import {
  getCustomerTypeForUser,
  getDefaultCustomerType,
  getPrice,
  PricingError,
} from "../services/pricingService";

const productInclude = {
  productPrices: {
    include: { customerType: { select: { code: true } } },
  },
} as const satisfies Prisma.ProductInclude;

const getCatalogCustomerType = async (req: AuthRequest) => {
  if (req.user?.id && req.user.role !== "admin") {
    return getCustomerTypeForUser(req.user.id);
  }

  return getDefaultCustomerType();
};

const serializeProduct = (
  product: any,
  price: number,
  includeAllPrices: boolean,
) => {
  const { productPrices, ...catalogProduct } = product;
  const response: Record<string, any> = {
    ...catalogProduct,
    price,
  };

  if (includeAllPrices) {
    response.prices = (productPrices || []).reduce(
      (prices: Record<string, number>, productPrice: any) => {
        prices[productPrice.customerType.code] = productPrice.price;
        return prices;
      },
      {},
    );
  }

  return response;
};

const getPriceValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;

  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    throw new PricingError("Prices must be non-negative numbers", 400);
  }

  return price;
};

const getPriceUpdates = (body: Record<string, any>) => {
  const suppliedPrices =
    body.prices && typeof body.prices === "object" ? body.prices : {};

  const endUserPrice = getPriceValue(
    suppliedPrices[CUSTOMER_TYPE_CODES.END_USER] ??
      body.endUserPrice ??
      body.price,
  );
  const distributorPrice = getPriceValue(
    suppliedPrices[CUSTOMER_TYPE_CODES.DISTRIBUTOR] ?? body.distributorPrice,
  );

  return { endUserPrice, distributorPrice };
};

const getCatalogFields = (body: Record<string, any>) => {
  const allowedFields = [
    "name",
    "slug",
    "description",
    "mrp",
    "category",
    "size",
    "bottlesPerCase",
    "imageUrl",
    "images",
    "stock",
    "isAvailable",
    "costPrice",
    "reorderLevel",
    "supplierId",
    "popularity",
  ];
  const fields: Record<string, any> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) fields[field] = body[field];
  }

  return fields;
};

const sendPricingError = (error: unknown, res: Response) => {
  if (error instanceof PricingError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  return null;
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort,
      search,
      page = "1",
      limit = "12",
    } = req.query;
    const customerType = await getCatalogCustomerType(req);

    const priceFilter: Record<string, any> = {
      customerTypeId: customerType.id,
    };
    if (minPrice || maxPrice) {
      priceFilter.price = {};
      if (minPrice) priceFilter.price.gte = Number(minPrice);
      if (maxPrice) priceFilter.price.lte = Number(maxPrice);
    }

    const where: Record<string, any> = {
      isAvailable: true,
      productPrices: { some: priceFilter },
    };

    if (category) where.category = category as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(
      Math.max(parseInt(limit as string, 10) || 12, 1),
      100,
    );
    const isPriceSort = sort === "price_asc" || sort === "price_desc";
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "newest" ? { createdAt: "desc" } : { popularity: "desc" };

    const products = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
    });

    const serializedProducts = products
      .map((product) => {
        const productPrice = product.productPrices.find(
          (priceRecord) => priceRecord.customerType.code === customerType.code,
        );

        return productPrice
          ? serializeProduct(
              product,
              productPrice.price,
              req.user?.role === "admin",
            )
          : null;
      })
      .filter(Boolean) as Record<string, any>[];

    if (isPriceSort) {
      serializedProducts.sort((left, right) =>
        sort === "price_asc"
          ? left.price - right.price
          : right.price - left.price,
      );
    }

    const total = serializedProducts.length;
    const skip = (pageNum - 1) * limitNum;

    res.json({
      success: true,
      products: serializedProducts.slice(skip, skip + limitNum),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    res.status(500).json({ message: error.message });
  }
};

const getProductResponse = async (
  req: AuthRequest,
  lookup: Prisma.ProductWhereUniqueInput,
) => {
  const customerType = await getCatalogCustomerType(req);
  const product = await prisma.product.findUnique({
    where: lookup,
    include: productInclude,
  });

  if (!product) return null;

  const price = await getPrice(product.id, customerType.id);
  return serializeProduct(product, price, req.user?.role === "admin");
};

export const getProductBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const product = await getProductResponse(req, { slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, product });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const product = await getProductResponse(req, { id: req.params.id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, product });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    res.status(500).json({ message: error.message });
  }
};

// Admin: create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, mrp, category, size } = req.body;
    const { endUserPrice, distributorPrice } = getPriceUpdates(req.body);

    if (
      !name ||
      !slug ||
      !description ||
      endUserPrice == null ||
      mrp == null ||
      !category ||
      !size
    ) {
      return res.status(400).json({
        message:
          "Required fields: name, slug, description, end-user price, mrp, category, size",
      });
    }

    const catalogFields = getCatalogFields(req.body);
    const product = await prisma.product.create({
      data: {
        ...catalogFields,
        productPrices: {
          create: [
            {
              price: endUserPrice,
              customerType: {
                connect: { code: CUSTOMER_TYPE_CODES.END_USER },
              },
            },
            {
              price: distributorPrice ?? endUserPrice,
              customerType: {
                connect: { code: CUSTOMER_TYPE_CODES.DISTRIBUTOR },
              },
            },
          ],
        },
      } as Prisma.ProductCreateInput,
      include: productInclude,
    });

    res.status(201).json({
      success: true,
      product: serializeProduct(product, endUserPrice, true),
    });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Product or customer type price already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Admin: update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { endUserPrice, distributorPrice } = getPriceUpdates(req.body);
    const catalogFields = getCatalogFields(req.body);
    const priceUpdates: Array<{
      code: CustomerTypeCode;
      price: number;
    }> = [];

    if (endUserPrice !== undefined) {
      priceUpdates.push({
        code: CUSTOMER_TYPE_CODES.END_USER,
        price: endUserPrice,
      });
    }
    if (distributorPrice !== undefined) {
      priceUpdates.push({
        code: CUSTOMER_TYPE_CODES.DISTRIBUTOR,
        price: distributorPrice,
      });
    }

    const product = await prisma.$transaction(async (tx) => {
      if (Object.keys(catalogFields).length > 0) {
        await tx.product.update({
          where: { id: req.params.id },
          data: catalogFields,
        });
      }

      for (const priceUpdate of priceUpdates) {
        const customerType = await tx.customerType.findUnique({
          where: { code: priceUpdate.code },
        });
        if (!customerType) {
          throw new PricingError(
            `Customer type ${priceUpdate.code} is not configured`,
            503,
          );
        }

        await tx.productPrice.upsert({
          where: {
            productId_customerTypeId: {
              productId: req.params.id,
              customerTypeId: customerType.id,
            },
          },
          update: { price: priceUpdate.price },
          create: {
            productId: req.params.id,
            customerTypeId: customerType.id,
            price: priceUpdate.price,
          },
        });
      }

      return tx.product.findUnique({
        where: { id: req.params.id },
        include: productInclude,
      });
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    const endUserProductPrice = product.productPrices.find(
      (priceRecord) =>
        priceRecord.customerType.code === CUSTOMER_TYPE_CODES.END_USER,
    );

    res.json({
      success: true,
      product: serializeProduct(product, endUserProductPrice?.price ?? 0, true),
    });
  } catch (error: any) {
    if (sendPricingError(error, res)) return;
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Product or customer type price already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Admin: delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: error.message });
  }
};
