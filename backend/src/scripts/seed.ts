import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../config/db";
import { hashPassword } from "../models/User";

const products = [
  {
    name: "Bisleri 20L Water Jar",
    slug: "bisleri-20l-jar",
    description:
      "Premium 20-litre water jar for home and office. Enough for a week of hydration.",
    price: 100.0,
    mrp: 120.0,
    category: "jar" as const,
    size: "20L",
    bottlesPerCase: 1,
    imageUrl: "/images/bisleri/bisleri-20l.svg",
    stock: 200,
    isAvailable: true,
    popularity: 95,
  },
  {
    name: "Bisleri 10L Water Jar",
    slug: "bisleri-10l-jar",
    description:
      "Convenient 10-litre water jar for compact kitchens and smaller households.",
    price: 125.0,
    mrp: 140.0,
    category: "jar" as const,
    size: "10L",
    bottlesPerCase: 1,
    imageUrl: "/images/bisleri/bisleri-10l.svg",
    stock: 150,
    isAvailable: true,
    popularity: 80,
  },
  {
    name: "Bisleri 5L Water Jar",
    slug: "bisleri-5l-jar",
    description:
      "Portable 5-litre jar – perfect for travel and small gatherings.",
    price: 75.0,
    mrp: 85.0,
    category: "jar" as const,
    size: "5L",
    bottlesPerCase: 1,
    imageUrl: "/images/bisleri/bisleri-5l.svg",
    stock: 250,
    isAvailable: true,
    popularity: 70,
  },
  {
    name: "Bisleri 2L Case (9 Bottles)",
    slug: "bisleri-2l-case",
    description:
      "A case of nine 2-litre bottles. Great for families and offices.",
    price: 180.0,
    mrp: 200.0,
    category: "case" as const,
    size: "2L",
    bottlesPerCase: 9,
    imageUrl: "/images/bisleri/bisleri-2l.svg",
    stock: 100,
    isAvailable: true,
    popularity: 60,
  },
  {
    name: "Bisleri 1L Case (12 Bottles)",
    slug: "bisleri-1l-case",
    description: "Twelve 1-litre bottles – ideal for daily use and gatherings.",
    price: 240.0,
    mrp: 264.0,
    category: "case" as const,
    size: "1L",
    bottlesPerCase: 12,
    imageUrl: "/images/bisleri/bisleri-1l.svg",
    stock: 120,
    isAvailable: true,
    popularity: 85,
  },
  {
    name: "Bisleri 500ml Case (24 Bottles)",
    slug: "bisleri-500ml-case",
    description:
      "A case of twenty-four 500ml bottles. Perfect for events and parties.",
    price: 240.0,
    mrp: 264.0,
    category: "case" as const,
    size: "500ml",
    bottlesPerCase: 24,
    imageUrl: "/images/bisleri/bisleri-500ml-box.svg",
    stock: 100,
    isAvailable: true,
    popularity: 75,
  },
  {
    name: "Bisleri 250ml Case (48 Bottles)",
    slug: "bisleri-250ml-case",
    description:
      "Forty-eight compact 250ml bottles – perfect for meetings and small events.",
    price: 290.0,
    mrp: 320.0,
    category: "case" as const,
    size: "250ml",
    bottlesPerCase: 48,
    imageUrl: "/images/bisleri/bisleri-250ml.svg",
    stock: 80,
    isAvailable: true,
    popularity: 50,
  },
  {
    name: "Bisleri 200ml Case (48 Bottles)",
    slug: "bisleri-200ml-case",
    description:
      "Forty-eight mini 200ml bottles. Compact, perfect for trains & bus journeys.",
    price: 260.0,
    mrp: 288.0,
    category: "case" as const,
    size: "200ml",
    bottlesPerCase: 48,
    imageUrl: "/images/bisleri/bisleri-200ml.svg",
    stock: 60,
    isAvailable: true,
    popularity: 40,
  },
];

const seed = async () => {
  try {
    console.log("🌱 Starting seed...");

    // Delete existing data
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed products
    await prisma.product.createMany({
      data: products,
    });
    console.log(`✅ Seeded ${products.length} products`);

    // Create admin user
    const hashedPassword = await hashPassword("admin123");
    const admin = await prisma.user.create({
      data: {
        name: "Bisleri Admin",
        email: "admin@bisleri-vasai.com",
        phone: "9999999999",
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("✅ Admin user created (admin@bisleri-vasai.com / admin123)");

    // Create test customer user
    const customerPassword = await hashPassword("customer123");
    const customer = await prisma.user.create({
      data: {
        name: "Test Customer",
        email: "customer@bisleri-vasai.com",
        phone: "8888888888",
        password: customerPassword,
        role: "customer",
      },
    });

    // Create address for customer
    await prisma.address.create({
      data: {
        userId: customer.id,
        street: "123 Main Street",
        area: "Vasai West",
        city: "Vasai",
        pincode: "401201",
        isDefault: true,
      },
    });
    console.log(
      "✅ Test customer created (customer@bisleri-vasai.com / customer123)",
    );

    // Create cart for customer
    await prisma.cart.create({
      data: {
        userId: customer.id,
      },
    });
    console.log("✅ Test customer cart created");

    console.log("🌱 Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
