#!/usr/bin/env node
require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
});
const seedSQL = `
INSERT INTO "Product" (
  "id",
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
  "popularity",
  "costPrice",
  "reorderLevel",
  "supplierId",
  "createdAt",
  "updatedAt"
) VALUES

(
  'prod-1',
  'Bisleri 20L Water Jar',
  'bisleri-20l-jar',
  'Premium 20-litre water jar for home and office.',
  100,
  120,
  'jar',
  '20L',
  1,
  '/images/bisleri/bisleri-20l.png',
  ARRAY['/images/bisleri/bisleri-20l.png'],
  200,
  true,
  95,
  70,
  20,
  NULL,
  NOW(),
  NOW()
),

(
  'prod-2',
  'Bisleri 10L Water Jar',
  'bisleri-10l-jar',
  'Convenient 10-litre water jar for compact kitchens.',
  125,
  140,
  'jar',
  '10L',
  1,
  '/images/bisleri/bisleri-10l.svg',
  ARRAY['/images/bisleri/bisleri-10l.svg'],
  150,
  true,
  80,
  90,
  20,
  NULL,
  NOW(),
  NOW()
),

(
  'prod-3',
  'Bisleri 5L Water Jar',
  'bisleri-5l-jar',
  'Portable 5-litre jar for travel and small gatherings.',
  75,
  85,
  'jar',
  '5L',
  1,
  '/images/bisleri/bisleri-5l.svg',
  ARRAY['/images/bisleri/bisleri-5l.svg'],
  250,
  true,
  70,
  50,
  20,
  NULL,
  NOW(),
  NOW()
),

(
  'prod-4',
  'Bisleri 2L Case (9 Bottles)',
  'bisleri-2l-case',
  'Case of 9 bottles of 2 litres each.',
  180,
  200,
  'case',
  '2L',
  9,
  '/images/bisleri/bisleri-2L.png',
  ARRAY['/images/bisleri/bisleri-2L.png'],
  100,
  true,
  60,
  140,
  15,
  NULL,
  NOW(),
  NOW()
),

(
  'prod-5',
  'Bisleri 1L Case (12 Bottles)',
  'bisleri-1l-case',
  'Case of 12 bottles of 1 litre each.',
  240,
  264,
  'case',
  '1L',
  12,
  '/images/bisleri/bisleri-1l.jpg',
  ARRAY['/images/bisleri/bisleri-1l.jpg'],
  120,
  true,
  85,
  190,
  15,
  NULL,
  NOW(),
  NOW()
),

(
  'prod-6',
  'Bisleri 500ml Case (24 Bottles)',
  'bisleri-500ml-case',
  'Case of 24 bottles of 500ml each.',
  240,
  264,
  'case',
  '500ml',
  24,
  '/images/bisleri/bisleri-500ml-box.png',
  ARRAY['/images/bisleri/bisleri-500ml-box.png'],
  100,
  true,
  75,
  180,
  15,
  NULL,
  NOW(),
  NOW()
),

(
  'prod-7',
  'Bisleri 250ml Case (48 Bottles)',
  'bisleri-250ml-case',
  'Case of 48 bottles of 250ml each.',
  290,
  320,
  'case',
  '250ml',
  48,
  '/images/bisleri/bisleri-250ml.png',
  ARRAY['/images/bisleri/bisleri-250ml.png'],
  80,
  true,
  50,
  220,
  10,
  NULL,
  NOW(),
  NOW()
),

(
  'prod-8',
  'Bisleri 200ml Case (48 Bottles)',
  'bisleri-200ml-case',
  'Case of 48 bottles of 200ml each.',
  260,
  288,
  'case',
  '200ml',
  48,
  '/images/bisleri/bisleri-200ml.svg',
  ARRAY['/images/bisleri/bisleri-200ml.svg'],
  60,
  true,
  40,
  200,
  10,
  NULL,
  NOW(),
  NOW()
)

ON CONFLICT ("slug") DO NOTHING;
`;
// const seedSQL = `
// INSERT INTO "Product" ("id", "name", "slug", "description", "price", "mrp", "category", "size", "bottlesPerCase", "imageUrl", "stock", "isAvailable", "popularity", "createdAt", "updatedAt") VALUES
// ('prod-1', 'Bisleri 20L Water Jar', 'bisleri-20l-jar', 'Premium 20-litre water jar for home and office. Enough for a week of hydration.', 100, 120, 'jar', '20L', 1, '/images/bisleri/bisleri-20l.png', 200, true, 95, NOW(), NOW()),
// ('prod-2', 'Bisleri 10L Water Jar', 'bisleri-10l-jar', 'Convenient 10-litre water jar for compact kitchens and smaller households.', 125, 140, 'jar', '10L', 1, '/images/bisleri/bisleri-10l.svg', 150, true, 80, NOW(), NOW()),
// ('prod-3', 'Bisleri 5L Water Jar', 'bisleri-5l-jar', 'Portable 5-litre jar – perfect for travel and small gatherings.', 75, 85, 'jar', '5L', 1, '/images/bisleri/bisleri-5l.svg', 250, true, 70, NOW(), NOW()),
// ('prod-4', 'Bisleri 2L Case (9 Bottles)', 'bisleri-2l-case', 'A case of nine 2-litre bottles. Great for families and offices.', 180, 200, 'case', '2L', 9, '/images/bisleri/bisleri-2L.png', 100, true, 60, NOW(), NOW()),
// ('prod-5', 'Bisleri 1L Case (12 Bottles)', 'bisleri-1l-case', 'Twelve 1-litre bottles – ideal for daily use and gatherings.', 240, 264, 'case', '1L', 12, '/images/bisleri/bisleri-1l.jpg', 120, true, 85, NOW(), NOW()),
// ('prod-6', 'Bisleri 500ml Case (24 Bottles)', 'bisleri-500ml-case', 'A case of twenty-four 500ml bottles. Perfect for events and parties.', 240, 264, 'case', '500ml', 24, '/images/bisleri/bisleri-500ml-box.png', 100, true, 75, NOW(), NOW()),
// ('prod-7', 'Bisleri 250ml Case (48 Bottles)', 'bisleri-250ml-case', 'Forty-eight compact 250ml bottles – perfect for meetings and small events.', 290, 320, 'case', '250ml', 48, '/images/bisleri/bisleri-250ml.png', 80, true, 50, NOW(), NOW()),
// ('prod-8', 'Bisleri 200ml Case (48 Bottles)', 'bisleri-200ml-case', 'Forty-eight mini 200ml bottles. Compact, perfect for trains & bus journeys.', 260, 288, 'case', '200ml', 48, '/images/bisleri/bisleri-200ml.svg', 60, true, 40, NOW(), NOW())
// ON CONFLICT DO NOTHING;
// `;

async function seed() {
  try {
    console.log("🌱 Connecting to database...");
    await client.connect();
    console.log("✓ Connected\n");

    console.log("📝 Seeding products...");
    await client.query(seedSQL);
    console.log("✅ Successfully seeded 8 products!\n");

    console.log("Available products:");
    console.log("  ✓ Bisleri 20L Water Jar (₹100)");
    console.log("  ✓ Bisleri 10L Water Jar (₹125)");
    console.log("  ✓ Bisleri 5L Water Jar (₹75)");
    console.log("  ✓ Bisleri 2L Case (₹180)");
    console.log("  ✓ Bisleri 1L Case (₹240)");
    console.log("  ✓ Bisleri 500ml Case (₹240)");
    console.log("  ✓ Bisleri 250ml Case (₹290)");
    console.log("  ✓ Bisleri 200ml Case (₹260)\n");

    console.log("🔄 Refreshing frontend...");
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
