import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { config } from "../config";

const products = [
  {
    name: "Bisleri 20L Water Jar",
    slug: "bisleri-20l-jar",
    description:
      "Premium 20-litre water jar for home and office. Enough for a week of hydration.",
    price: 100,
    mrp: 120,
    category: "jar",
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
    price: 125,
    mrp: 140,
    category: "jar",
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
    price: 75,
    mrp: 85,
    category: "jar",
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
    price: 180,
    mrp: 200,
    category: "case",
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
    price: 240,
    mrp: 264,
    category: "case",
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
    price: 240,
    mrp: 264,
    category: "case",
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
    price: 290,
    mrp: 320,
    category: "case",
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
    price: 260,
    mrp: 288,
    category: "case",
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
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");

    // Seed products
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);

    // Create admin user
    const existingAdmin = await User.findOne({
      email: "admin@bisleri-vasai.com",
    });
    if (!existingAdmin) {
      await User.create({
        name: "Bisleri Admin",
        email: "admin@bisleri-vasai.com",
        phone: "9999999999",
        password: "admin123",
        role: "admin",
      });
      console.log("✅ Admin user created (admin@bisleri-vasai.com / admin123)");
    }

    console.log("🌱 Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
