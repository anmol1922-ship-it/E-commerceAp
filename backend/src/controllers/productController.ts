import { Request, Response } from "express";
import { prisma } from "../config/db";

export const getProducts = async (req: Request, res: Response) => {
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

    const where: any = { isAvailable: true };

    if (category) where.category = category as string;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { popularity: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "newest") orderBy = { createdAt: "desc" };

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, price, mrp, category, size } = req.body;
    if (
      !name ||
      !slug ||
      !description ||
      price == null ||
      mrp == null ||
      !category ||
      !size
    ) {
      return res.status(400).json({
        message:
          "Required fields: name, slug, description, price, mrp, category, size",
      });
    }

    const allowedFields = [
      "name",
      "slug",
      "description",
      "price",
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
    ];
    const sanitized: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        sanitized[field] = req.body[field];
      }
    }

    const product = await prisma.product.create({ data: sanitized as any });
    res.status(201).json({ success: true, product });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Product with this slug already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Admin: update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const allowedFields = [
      "name",
      "slug",
      "description",
      "price",
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
    const sanitized: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        sanitized[field] = req.body[field];
      }
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: sanitized,
    });
    res.json({ success: true, product });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Product with this slug already exists" });
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
