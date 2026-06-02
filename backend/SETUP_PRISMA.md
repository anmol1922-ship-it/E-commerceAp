# Backend Setup Guide - PostgreSQL + Prisma

This backend has been fully migrated from MongoDB + Mongoose to **PostgreSQL + Prisma ORM**.

## Prerequisites

- Node.js 18+
- PostgreSQL 12+ (local or Docker)
- Git

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:

- `@prisma/client` (runtime query client)
- `prisma` (CLI for migrations)
- All other dependencies (express, jwt, etc.)

### 2. Configure Environment

Ensure `.env` file exists with:

```
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bisleri?schema=public"
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=rzp_test_your_secret_here
```

### 3. Start PostgreSQL

#### Option A: Docker (Recommended)

```bash
docker run -d \
  --name postgres_bisleri \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bisleri \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:latest
```

#### Option B: Local Installation

Ensure PostgreSQL is running on `localhost:5432` with user `postgres` and password `postgres`.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

This generates TypeScript types and the Prisma client from [prisma/schema.prisma](./prisma/schema.prisma).

### 5. Create Database Schema

```bash
npx prisma migrate dev --name init
```

This:

- Creates all 7 tables in PostgreSQL
- Generates migration files
- Generates Prisma client types

### 6. Seed Initial Data (Optional)

```bash
npm run seed
```

This populates:

- **8 Bisleri water products** (20L jar, 10L jar, 5L jar, 2L case, 1L case, 500ml case, 250ml case, 200ml case)
- **Admin user**: admin@bisleri-vasai.com / admin123
- **Test customer**: customer@bisleri-vasai.com / customer123 (with default address in Vasai)

### 7. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 8. View Database (Optional)

```bash
npx prisma studio
```

Opens browser UI to inspect/edit database directly at `http://localhost:5555`

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express server setup
│   ├── config/
│   │   ├── db.ts             # Prisma client (PostgreSQL connection)
│   │   ├── index.ts          # Config variables from .env
│   ├── models/               # Prisma types & utilities
│   │   ├── User.ts           # User type + password helpers
│   │   ├── Product.ts        # Product type
│   │   ├── Order.ts          # Order & OrderItem types
│   │   ├── Cart.ts           # Cart & CartItem types
│   ├── middleware/
│   │   ├── auth.ts           # JWT + Prisma auth middleware
│   ├── routes/               # Express routes
│   │   ├── auth.ts           # /api/auth (register, login, profile, address)
│   │   ├── products.ts       # /api/products (list, filter, get, admin CRUD)
│   │   ├── cart.ts           # /api/cart (get, add, update, remove, clear)
│   │   ├── orders.ts         # /api/orders (create, verify, list, admin)
│   ├── controllers/          # Request handlers (now using Prisma)
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── cartController.ts
│   │   ├── orderController.ts
│   ├── scripts/
│   │   ├── seed.ts           # Database seeding with Prisma
│   │
├── prisma/
│   ├── schema.prisma         # Database schema definition (PostgreSQL)
│   ├── migrations/           # Auto-generated migration files
│
├── .env                      # Environment variables (local only)
├── .env.example              # Example env (commit to git)
├── package.json
├── tsconfig.json
```

## Database Schema

### User

- `id` (Int, auto-increment)
- `email` (String, unique)
- `phone` (String)
- `password` (String, hashed with bcryptjs)
- `name` (String)
- `role` (Enum: "customer" | "admin")
- `addresses` (Relation: 1-many Address)
- `orders` (Relation: 1-many Order)
- `createdAt`, `updatedAt` (Timestamps)

### Address

- `id` (Int, auto-increment)
- `userId` (Int, foreign key)
- `street` (String)
- `area` (String)
- `city` (String, default: "Vasai")
- `pincode` (String, validated: 401201-401599 for Vasai)
- `isDefault` (Boolean)
- `createdAt`, `updatedAt`

### Product

- `id` (Int, auto-increment)
- `name` (String)
- `slug` (String, unique)
- `description` (Text)
- `price` (Decimal)
- `mrp` (Decimal)
- `category` (Enum: "jar" | "case")
- `size` (String)
- `bottlesPerCase` (Int)
- `imageUrl` (String)
- `stock` (Int)
- `isAvailable` (Boolean)
- `popularity` (Int)
- `createdAt`, `updatedAt`

### Cart

- `id` (Int, auto-increment)
- `userId` (Int, unique - one cart per user)
- `items` (Relation: 1-many CartItem)
- `createdAt`, `updatedAt`

### CartItem

- `id` (Int, auto-increment)
- `cartId` (Int, foreign key)
- `productId` (Int, foreign key)
- `quantity` (Int)
- `product` (Relation)
- `createdAt`, `updatedAt`

### Order

- `id` (Int, auto-increment)
- `userId` (Int, foreign key)
- `items` (Relation: 1-many OrderItem)
- `paymentMethod` (Enum: "razorpay" | "cod")
- `paymentStatus` (Enum: "pending" | "paid" | "failed" | "refunded" | "pod")
- `razorpayOrderId` (String, optional)
- `razorpayPaymentId` (String, optional)
- `subtotal` (Decimal)
- `gst` (Decimal, 18%)
- `deliveryCharge` (Decimal, ₹30 or free if subtotal > ₹500)
- `totalAmount` (Decimal)
- `status` (Enum: "placed" | "confirmed" | "dispatched" | "delivered" | "cancelled")
- `deliverySlot` (String)
- `trackingInfo` (JSON, optional)
- `createdAt`, `updatedAt`

### OrderItem

- `id` (Int, auto-increment)
- `orderId` (Int, foreign key)
- `productId` (Int, foreign key)
- `name` (String)
- `price` (Decimal)
- `quantity` (Int)
- `product` (Relation)
- `createdAt`, `updatedAt`

## Available NPM Scripts

```bash
npm run dev          # Start dev server with auto-reload (port 3000)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled code (production)
npm run lint         # Run ESLint
npm test             # Run tests (if configured)
npm run seed         # Seed database with initial data
```

### Prisma-Specific Scripts (in package.json)

```bash
npm run prisma:generate   # Generate Prisma client types
npm run prisma:migrate    # Run prisma migrate dev
npm run prisma:studio     # Open Prisma Studio (visual DB editor)
```

## Frontend Integration

The frontend connects via API at `http://localhost:3000/api`.

**No frontend changes required** — frontend was built to work with these exact API endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/add-address`
- `GET /api/products` (with filters)
- `GET /api/products/:slug`
- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove/:productId`
- `DELETE /api/cart/clear`
- `POST /api/orders`
- `POST /api/orders/verify-payment`
- `GET /api/orders` (my orders)
- `GET /api/orders/:id`

## Troubleshooting

### Error: Cannot find module '@prisma/client'

```bash
npm install
npx prisma generate
```

### Error: Database connection refused

Ensure PostgreSQL is running:

```bash
# Check if Docker container is running
docker ps | grep postgres

# Or restart it
docker start postgres_bisleri
```

### Error: Tables don't exist

Run migrations:

```bash
npx prisma migrate dev --name init
```

### Error: "PrismaClientConstructorError"

Ensure `.env` has valid `DATABASE_URL`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bisleri?schema=public"
```

### Error: Razorpay payment fails

Update `.env` with your test keys from [https://dashboard.razorpay.com](https://dashboard.razorpay.com):

```
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=rzp_test_your_secret
```

## Technology Stack

| Layer      | Technology        | Version   |
| ---------- | ----------------- | --------- |
| Runtime    | Node.js           | 18+       |
| Language   | TypeScript        | 5.x       |
| Framework  | Express.js        | 4.21      |
| ORM        | Prisma            | 5.8       |
| Database   | PostgreSQL        | 12+       |
| Auth       | JWT + bcryptjs    | 9.0 / 2.4 |
| Payment    | Razorpay          | 2.9       |
| Validation | express-validator | 7.2       |
| Logging    | Winston           | 3.14      |

## Migration from MongoDB

This backend was originally built with MongoDB + Mongoose. If you had old data:

1. **Export MongoDB data** (BSON or JSON)
2. **Transform to Prisma format** (write custom migration script)
3. **Import via Prisma**:

```typescript
// Example in migration script
const products = await mongoCollection.find().toArray();
for (const product of products) {
  await prisma.product.create({
    data: {
      name: product.name,
      // ... map fields
    },
  });
}
```

## Next: Start Frontend

In another terminal, run:

```bash
cd frontend
npm run dev
```

Frontend starts on `http://localhost:5173` and connects to backend at `http://localhost:3000/api`.

## Questions?

Check:

1. [Prisma Docs](https://www.prisma.io/docs/)
2. [Express Docs](https://expressjs.com/)
3. [PostgreSQL Docs](https://www.postgresql.org/docs/)
