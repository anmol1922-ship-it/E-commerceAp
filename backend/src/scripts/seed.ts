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
    price: 90.0,
    mrp: 100.0,
    category: "jar" as const,
    size: "20L",
    bottlesPerCase: 1,
    imageUrl: "/images/bisleri/bisleri-20l.png",
    stock: 500,
    isAvailable: true,
    popularity: 95,
  },
  {
    name: "Bisleri 10L Water Jar",
    slug: "bisleri-10l-jar",
    description:
      "Convenient 10-litre water jar for compact kitchens and smaller households.",
    price: 125.0,
    mrp: 130.0,
    category: "jar" as const,
    size: "10L",
    bottlesPerCase: 1,
    imageUrl: "/images/bisleri/bisleri-10l.png",
    stock: 250,
    isAvailable: true,
    popularity: 80,
  },
  {
    name: "Bisleri 5L Water Jar",
    slug: "bisleri-5l-jar",
    description:
      "Portable 5-litre jar – perfect for travel and small gatherings.",
    price: 75.0,
    mrp: 80.0,
    category: "jar" as const,
    size: "5L",
    bottlesPerCase: 1,
    imageUrl: "/images/bisleri/bisleri-5L.png",
    stock: 250,
    isAvailable: true,
    popularity: 70,
  },
  {
    name: "Bisleri 2L Case (9 Bottles)",
    slug: "bisleri-2l-case",
    description:
      "A case of nine 2-litre bottles. Great for families and offices.",
    price: 250.0,
    mrp: 270.0,
    category: "case" as const,
    size: "2L",
    bottlesPerCase: 9,
    imageUrl: "/images/bisleri/bisleri-2L.png",
    stock: 150,
    isAvailable: true,
    popularity: 60,
  },
  {
    name: "Bisleri 1L Case (12 Bottles)",
    slug: "bisleri-1l-case",
    description: "Twelve 1-litre bottles – ideal for daily use and gatherings.",
    price: 200.0,
    mrp: 240.0,
    category: "case" as const,
    size: "1L",
    bottlesPerCase: 12,
    imageUrl: "/images/bisleri/bisleri-1l.jpg",
    stock: 400,
    isAvailable: true,
    popularity: 85,
  },
  {
    name: "Bisleri 500ml Case (24 Bottles)",
    slug: "bisleri-500ml-case",
    description:
      "A case of twenty-four 500ml bottles. Perfect for events and parties.",
    price: 200.0,
    mrp: 240.0,
    category: "case" as const,
    size: "500ml",
    bottlesPerCase: 24,
    imageUrl: "/images/bisleri/bisleri-500ml.jpg",
    stock: 300,
    isAvailable: true,
    popularity: 75,
  },
  {
    name: "Bisleri 250ml Case (48 Bottles)",
    slug: "bisleri-250ml-case",
    description:
      "Forty-eight compact 250ml bottles – perfect for meetings and small events.",
    price: 280.0,
    mrp: 280.0,
    category: "case" as const,
    size: "250ml",
    bottlesPerCase: 48,
    imageUrl: "/images/bisleri/bisleri-250ml.jpg",
    stock: 50,
    isAvailable: true,
    popularity: 50,
  },
  {
    name: "Bisleri 200ml Case (48 Bottles)",
    slug: "bisleri-200ml-case",
    description:
      "Forty-eight mini 200ml bottles. Compact, perfect for trains & bus journeys.",
    price: 240.0,
    mrp: 240.0,
    category: "case" as const,
    size: "200ml",
    bottlesPerCase: 48,
    imageUrl: "/images/bisleri/bisleri-200ml.jpg",
    stock: 300,
    isAvailable: true,
    popularity: 40,
  },
  {
    name: "Bisleri Soda 750ml Case (12 Bottles)",
    slug: "bisleri-soda-750ml-case",
    description:
      "Refreshing Bisleri Soda 750ml bottles. Ideal for restaurants, parties, and everyday use.",
    price: 150.0,
    mrp: 240.0,
    category: "case" as const,
    size: "750ml",
    bottlesPerCase: 12,
    imageUrl: "/images/bisleri/bisleri-soda-750ml.jpg",
    stock: 40,
    isAvailable: true,
    popularity: 35,
  },
  {
    name: "Bisleri Soda 300ml Case (24 Bottles)",
    slug: "bisleri-soda-300ml-case",
    description:
      "Compact 300ml Bisleri Soda bottles. Perfect for individual servings and events.",
    price: 200.0,
    mrp: 240.0,
    category: "case" as const,
    size: "300ml",
    bottlesPerCase: 24,
    imageUrl: "/images/bisleri/bisleri-soda-300ml.jpg",
    stock: 30,
    isAvailable: true,
    popularity: 30,
  },
  {
    name: "Bisleri Pop 160ml Case (24 Bottles)",
    slug: "bisleri-pop-160ml-case",
    description:
      "Bisleri Pop 160ml soft drink bottles. Great for parties and on-the-go refreshment.",
    price: 200.0,
    mrp: 240.0,
    category: "case" as const,
    size: "160ml",
    bottlesPerCase: 24,
    imageUrl: "/images/bisleri/bisleri-pop-160ml.jpg",
    stock: 30,
    isAvailable: true,
    popularity: 25,
  },
  {
    name: "Bisleri Limonata 160ml Case (24 Bottles)",
    slug: "bisleri-limonata-160ml-case",
    description:
      "Refreshing Bisleri Limonata 160ml bottles with a tangy lemon flavor. Perfect for every occasion.",
    price: 200.0,
    mrp: 240.0,
    category: "case" as const,
    size: "160ml",
    bottlesPerCase: 24,
    imageUrl: "/images/bisleri/bisleri-limonata-160ml.jpg",
    stock: 30,
    isAvailable: true,
    popularity: 25,
  },
];

const seed = async () => {
  try {
    console.log("🌱 Starting seed...");

    // Delete existing data
    // await prisma.cartItem.deleteMany({});
    // await prisma.cart.deleteMany({});
    // await prisma.orderItem.deleteMany({});
    // await prisma.order.deleteMany({});
    // await prisma.product.deleteMany({});
    // await prisma.address.deleteMany({});
    // await prisma.user.deleteMany({});

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
