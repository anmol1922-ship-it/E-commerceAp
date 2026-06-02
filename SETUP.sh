#!/bin/bash
# Quick Setup Script for PostgreSQL + Prisma Backend

echo "🚀 E-Commerce Backend Setup"
echo "MongoDB → PostgreSQL + Prisma Migration"
echo ""

# Step 1: Install dependencies
echo "1️⃣ Installing dependencies..."
cd backend
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Generate Prisma client
echo "2️⃣ Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Step 3: Start PostgreSQL (Docker)
echo "3️⃣ Starting PostgreSQL (Docker)..."
docker run -d \
  --name bisleri_postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bisleri \
  postgres:latest

echo "Waiting for PostgreSQL to start..."
sleep 5
echo "✅ PostgreSQL started"
echo ""

# Step 4: Run migrations
echo "4️⃣ Creating database tables..."
npx prisma migrate dev --name init
echo "✅ Database tables created"
echo ""

# Step 5: Seed data
echo "5️⃣ Seeding initial data..."
npm run seed
echo "✅ Database seeded"
echo ""

# Step 6: Ready to start
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To start the backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Test credentials:"
echo "  Admin:    admin@bisleri-vasai.com / admin123"
echo "  Customer: customer@bisleri-vasai.com / customer123"
echo ""
echo "To view database:"
echo "  npx prisma studio"
echo ""
echo "Backend URL: http://localhost:3000"
echo "Frontend URL: http://localhost:5173"
