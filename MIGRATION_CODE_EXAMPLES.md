# Before & After: Mongoose → Prisma Code Examples

This document shows concrete examples of how the code changed during migration.

## 1. Database Connection

### Before (MongoDB + Mongoose)

```typescript
// src/config/db.ts
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
```

### After (PostgreSQL + Prisma)

```typescript
// src/config/db.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    // Connection is established immediately on import
    console.log("🚀 PostgreSQL connected via Prisma");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
```

---

## 2. User Model

### Before (Mongoose Schema)

```typescript
// src/models/User.ts
import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: [
      { street: String, area: String, city: String, pincode: String },
    ],
  },
  { timestamps: true },
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (password: string) {
  return await bcryptjs.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
```

### After (Prisma Types + Utilities)

```typescript
// src/models/User.ts
import { User as PrismaUser } from "@prisma/client";
import bcryptjs from "bcryptjs";

export type User = PrismaUser;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcryptjs.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcryptjs.compare(password, hash);
};
```

---

## 3. Register Endpoint

### Before (Mongoose)

```typescript
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Password hashing happens automatically in pre-save hook
    const user = await User.create({
      email,
      password, // Gets hashed in DB before save
      name,
      phone,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.status(201).json({ success: true, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

### After (Prisma)

```typescript
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Explicit password hashing before storing
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Already hashed
        name,
        phone,
        role: "customer",
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(201).json({ success: true, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 4. Login Endpoint

### Before (Mongoose)

```typescript
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Uses instance method from schema
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ success: true, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

### After (Prisma)

```typescript
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Uses utility function
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ success: true, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 5. Product List with Filtering

### Before (Mongoose)

```typescript
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort,
      page = "1",
      limit = "12",
    } = req.query;

    const filter: any = { isAvailable: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: any = { popularity: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

### After (Prisma)

```typescript
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort,
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

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      products,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

**Key Differences:**

- `$gte` / `$lte` → `gte` / `lte`
- `$regex` with `$options` → `contains` with `mode`
- `.sort()` chaining → `orderBy` object
- `.skip()` / `.limit()` → `skip` / `take`
- Manual `.countDocuments()` → `Promise.all()` for parallel queries

---

## 6. Cart Operations (Complex Example)

### Before (Mongoose - Nested Arrays)

```typescript
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Find and update nested item or push new
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    // Save entire cart (including nested array)
    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, cart });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

### After (Prisma - Separate CartItem Table)

```typescript
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

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

    // Check if item exists
    const existingItem = cart.items.find(
      (item: any) => item.productId == productId,
    );

    if (existingItem) {
      // Update existing CartItem
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Create new CartItem
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: Number(productId),
          quantity,
        },
      });
    }

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    res.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

**Key Differences:**

- `cart.items.find()` then modify + `cart.save()` → Separate `prisma.cartItem.update()` call
- Nested arrays → Explicit relationship queries with `include`
- Manual population → `include: { items: { include: { product: true } } }`

---

## 7. Order Creation (Most Complex - Transactions)

### Before (Mongoose)

```typescript
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { shippingAddress, deliverySlot, paymentMethod } = req.body;

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    // Validate and build items
    const items: any[] = [];
    let subtotal = 0;
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });
      subtotal += product.price * cartItem.quantity;
    }

    // Calculate totals
    const gst = Math.round(subtotal * 0.05 * 100) / 100;
    const deliveryCharge = subtotal >= 1000 ? 0 : 10;
    const totalAmount =
      Math.round((subtotal + gst + deliveryCharge) * 100) / 100;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      deliverySlot,
      paymentMethod,
      subtotal,
      gst,
      deliveryCharge,
      totalAmount,
    });

    // Update stock (separate operations - NOT atomic!)
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate((cartItem.product as any)._id, {
        $inc: { stock: -cartItem.quantity, popularity: cartItem.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

**Problem:** If stock update fails after order creation, order exists but stock not reduced!

### After (Prisma with Atomic Transactions)

```typescript
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { shippingAddress, deliverySlot, paymentMethod } = req.body;

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    // Validate and build items
    const items: any[] = [];
    let subtotal = 0;
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });
      subtotal += Number(product.price) * cartItem.quantity;
    }

    // Calculate totals
    const gst = Math.round(subtotal * 0.05 * 100) / 100;
    const deliveryCharge = subtotal >= 1000 ? 0 : 10;
    const totalAmount =
      Math.round((subtotal + gst + deliveryCharge) * 100) / 100;

    // ATOMIC TRANSACTION: All or nothing!
    const order = await prisma.$transaction(async (tx: any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          paymentMethod: paymentMethod as "razorpay" | "cod",
          subtotal,
          gst,
          deliveryCharge,
          totalAmount,
          deliverySlot,
          paymentStatus: paymentMethod === "razorpay" ? "pending" : "pod",
          status: paymentMethod === "razorpay" ? "placed" : "confirmed",
        },
      });

      // Create order items
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          },
        });

        // Reduce stock immediately (part of transaction)
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            popularity: { increment: item.quantity },
          },
        });
      }

      // Clear cart items (part of transaction)
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

**Key Advantages:**

- `prisma.$transaction()` ensures ALL operations succeed or ALL rollback
- No partial orders if stock update fails
- No orphaned cart items if order creation fails
- ACID compliance guaranteed

---

## 8. Seeding (Database Initialization)

### Before (Mongoose)

```typescript
// scripts/seed.ts
import mongoose from "mongoose";
import { Product } from "../models/Product";
import { User } from "../models/User";

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing
    await Product.deleteMany({});
    await User.deleteMany({});

    // Insert products
    await Product.insertMany(productsArray);

    // Create admin
    await User.create({
      email: "admin@bisleri-vasai.com",
      password: "admin123", // Gets hashed in pre-save hook
      name: "Admin",
      phone: "9999999999",
      role: "admin",
    });

    console.log("✅ Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
```

### After (Prisma)

```typescript
// scripts/seed.ts
import { prisma } from "../config/db";
import { hashPassword } from "../models/User";

const seed = async () => {
  try {
    console.log("🌱 Starting seed...");

    // Clear all data (cascade delete)
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({});

    // Insert products
    await prisma.product.createMany({
      data: productsArray,
    });
    console.log(`✅ Seeded ${productsArray.length} products`);

    // Create admin with explicit password hashing
    const hashedPassword = await hashPassword("admin123");
    await prisma.user.create({
      data: {
        email: "admin@bisleri-vasai.com",
        password: hashedPassword,
        name: "Bisleri Admin",
        phone: "9999999999",
        role: "admin",
      },
    });
    console.log("✅ Admin user created");

    // Create test customer with address
    const customerPassword = await hashPassword("customer123");
    const customer = await prisma.user.create({
      data: {
        email: "customer@bisleri-vasai.com",
        password: customerPassword,
        name: "Test Customer",
        phone: "8888888888",
        role: "customer",
      },
    });

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
    console.log("✅ Test customer created with address");

    console.log("🌱 Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
```

**Key Differences:**

- Explicit order of deletion (cascade)
- `createMany()` vs `insertMany()`
- Explicit password hashing before storing
- Can create related data in same operation

---

## Summary: Query Pattern Changes

| Operation        | Mongoose                      | Prisma                                      |
| ---------------- | ----------------------------- | ------------------------------------------- |
| **Find one**     | `Model.findOne({...})`        | `prisma.model.findUnique()` / `findFirst()` |
| **Find many**    | `Model.find({...})`           | `prisma.model.findMany({...})`              |
| **Count**        | `Model.countDocuments({...})` | `prisma.model.count({...})`                 |
| **Create**       | `Model.create({...})`         | `prisma.model.create({...})`                |
| **Update**       | `Model.findByIdAndUpdate()`   | `prisma.model.update()`                     |
| **Delete**       | `Model.findByIdAndDelete()`   | `prisma.model.delete()`                     |
| **Increment**    | `$inc: { field: 1 }`          | `field: { increment: 1 }`                   |
| **Search**       | `{ $regex: "term" }`          | `{ contains: "term" }`                      |
| **AND logic**    | Field by field                | `AND: [...]` or implicit                    |
| **OR logic**     | `$or: [...]`                  | `OR: [...]`                                 |
| **Relations**    | `.populate()`                 | `include: {relation: true}`                 |
| **Transactions** | Custom session                | `$transaction([...])`                       |
| **Sort**         | `.sort({field: 1/-1})`        | `orderBy: {field: "asc"/"desc"}`            |
| **Limit**        | `.limit(n)`                   | `take: n`                                   |
| **Skip**         | `.skip(n)`                    | `skip: n`                                   |
