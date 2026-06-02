# Admin Dashboard - Data Flow & Integration Architecture

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Admin Pages                                          │  │
│  │  Dashboard | Inventory | Profit | Jar Returns | Etc  │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │  Axios HTTP Client (adminApi.ts)                     │  │
│  │  - Request interceptors (JWT token)                  │  │
│  │  - Response handlers                                 │  │
│  └────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (/api/admin/*)                           │  │
│  │  - /dashboard/kpis                                   │  │
│  │  - /inventory/products                               │  │
│  │  - /profit/report                                    │  │
│  │  - /jar-returns                                      │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │  Admin Controllers (adminController.ts)              │  │
│  │  - Business logic                                    │  │
│  │  - Data calculations                                 │  │
│  │  - Database queries                                  │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │  Prisma ORM                                           │  │
│  │  - Query builder                                     │  │
│  │  - Data transformation                               │  │
│  └────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │ Database Queries
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL/MongoDB)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables                                              │  │
│  │  - User | Product | Order | OrderItem               │  │
│  │  - InventoryTransaction | StockLedger                │  │
│  │  - JarReturn | Expense | ProfitReport                │  │
│  │  - Supplier | InventoryAlert                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: Dashboard KPI Calculation

#### Step 1: Frontend Request

```typescript
// frontend/src/pages/admin/dashboard/Dashboard.tsx
useEffect(() => {
  const fetchKPIs = async () => {
    const token = localStorage.getItem("bisleri_token");
    try {
      const response = await axios.get(
        "http://localhost:3000/api/admin/dashboard/kpis",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setKpis(response.data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  fetchKPIs();
}, []);
```

#### Step 2: Backend Route

```typescript
// backend/src/routes/admin.ts
router.get("/dashboard/kpis", authenticateToken, verifyAdmin, getDashboardKPIs);
```

#### Step 3: Controller Logic

```typescript
// backend/src/controllers/adminController.ts
export const getDashboardKPIs = async (req: Request, res: Response) => {
  try {
    // Get today's date boundaries
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    // Query database for today's orders
    const ordersToday = await prisma.order.findMany({
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
      },
      include: { orderItems: true },
    });

    // Calculate KPIs
    const ordersTodayCount = ordersToday.length;
    const ordersTodayAmount = ordersToday.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // ... more calculations ...

    // Return formatted response
    res.json({
      success: true,
      data: {
        ordersTodayCount,
        ordersTodayAmount,
        profitTodayAmount: Math.round(ordersTodayAmount * 0.38),
        // ... more fields ...
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};
```

#### Step 4: Database Query

```sql
-- Executed by Prisma
SELECT * FROM "Order"
WHERE "createdAt" >= '2026-06-15T00:00:00.000Z'
  AND "createdAt" <= '2026-06-15T23:59:59.999Z'
```

#### Step 5: Frontend Display

```typescript
// Display in KPI card
<div className="text-2xl font-bold">
  ₹{kpis.ordersTodayAmount}
</div>
<span className="text-green-600">↑ {kpis.ordersTodayTrend}%</span>
```

---

### Example 2: Add Stock Transaction

#### Step 1: Frontend Form Submission

```typescript
// frontend/src/pages/admin/inventory/InventoryManagement.tsx
const handleAddStock = async (formData) => {
  const token = localStorage.getItem("bisleri_token");

  try {
    const response = await axios.post(
      "http://localhost:3000/api/admin/inventory/add-stock",
      {
        productId: formData.productId,
        quantity: formData.quantity,
        costPrice: formData.costPrice,
        supplierId: formData.supplierId,
        invoiceNumber: formData.invoiceNumber,
        notes: formData.notes,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    // Show success message
    toast.success("Stock added successfully");
    // Refresh inventory list
    refreshInventory();
  } catch (error) {
    toast.error(error.response.data.message);
  }
};
```

#### Step 2: Backend Route Handler

```typescript
// backend/src/routes/admin.ts
router.post("/inventory/add-stock", authenticateToken, verifyAdmin, addStock);
```

#### Step 3: Controller Processing

```typescript
// backend/src/controllers/adminController.ts
export const addStock = async (req: Request, res: Response) => {
  const { productId, quantity, costPrice, supplierId, invoiceNumber, notes } =
    req.body;

  // 1. Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) return res.status(404).json({ message: "Product not found" });

  // 2. Create inventory transaction record
  const transaction = await prisma.inventoryTransaction.create({
    data: {
      productId,
      transactionType: "purchase",
      quantity,
      costPrice,
      supplierId,
      reference: invoiceNumber,
      notes,
    },
  });

  // 3. Update product quantity
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      quantity: product.quantity + quantity,
    },
  });

  // 4. Return success response
  res.json({
    success: true,
    message: "Stock added successfully",
    data: {
      transactionId: transaction.id,
      previousStock: product.quantity,
      newStock: updatedProduct.quantity,
    },
  });
};
```

#### Step 4: Database Transactions

```sql
-- Transaction 1: Insert into InventoryTransaction
INSERT INTO "InventoryTransaction" (
  "productId", "transactionType", "quantity", "costPrice",
  "supplierId", "reference", "notes", "createdAt"
) VALUES ('prod_1', 'purchase', 200, 80, 'sup_1', 'INV-..', '...', NOW());

-- Transaction 2: Update Product quantity
UPDATE "Product"
SET "quantity" = "quantity" + 200
WHERE "id" = 'prod_1';
```

#### Step 5: Frontend State Update

```typescript
// Update local state or Redux
setInventoryList(
  inventoryList.map((item) =>
    item.id === productId ? { ...item, currentStock: newStock } : item,
  ),
);

// Close modal and refresh
setShowAddStockModal(false);
```

---

## 📊 State Management Flow

### Redux State Structure

```typescript
// Redux slices for admin features
store.admin = {
  dashboard: {
    kpis: {
      /* KPI data */
    },
    loading: false,
    error: null,
  },
  inventory: {
    products: [
      /* product list */
    ],
    selectedProduct: null,
    loading: false,
    filters: { search: "", status: "" },
  },
  profit: {
    report: {
      /* profit data */
    },
    trends: [
      /* monthly trends */
    ],
    loading: false,
  },
  jarReturns: {
    records: [
      /* jar return records */
    ],
    stats: {
      /* summary stats */
    },
    loading: false,
  },
};
```

### Redux Actions Example

```typescript
// frontend/src/store/slices/adminSlice.ts
export const fetchDashboardKPIs = createAsyncThunk(
  "admin/fetchKPIs",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("bisleri_token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/kpis`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardKPIs.pending, (state) => {
        state.dashboard.loading = true;
      })
      .addCase(fetchDashboardKPIs.fulfilled, (state, action) => {
        state.dashboard.kpis = action.payload;
        state.dashboard.loading = false;
      });
  },
});
```

---

## 🔐 Authentication & Authorization Flow

### JWT Token Flow

```
1. User logs in
   └─→ Backend generates JWT with payload: { userId, role: 'admin', ... }
       └─→ Frontend stores it in localStorage

2. Admin accesses dashboard
   └─→ Frontend retrieves JWT from localStorage
       └─→ Includes in Authorization header
           └─→ Backend verifies token
               └─→ Extracts user role
                   └─→ Checks if role is 'admin'
                       └─→ Allows/Denies access

3. Token expires (7 days default)
   └─→ Frontend catches 401 Unauthorized
       └─→ Redirects to login
           └─→ User re-authenticates
```

### Middleware Chain

```typescript
// backend/src/routes/admin.ts
router.get(
  "/dashboard/kpis",
  authenticateToken, // Step 1: Verify JWT is valid
  verifyAdmin, // Step 2: Check user role is admin
  getDashboardKPIs, // Step 3: Execute controller logic
);

// middlewares
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
```

---

## 🔄 Real-Time Data Refresh Patterns

### Auto-Refresh Strategy

```typescript
// Option 1: Polling (every 5 minutes)
useEffect(() => {
  const interval = setInterval(
    () => {
      fetchDashboardKPIs();
    },
    5 * 60 * 1000,
  );

  return () => clearInterval(interval);
}, []);

// Option 2: Manual Refresh Button
const handleRefresh = () => {
  setLoading(true);
  Promise.all([
    fetchDashboardKPIs(),
    fetchRecentOrders(),
    fetchInventoryProducts(),
  ]).finally(() => setLoading(false));
};

// Option 3: WebSocket (real-time)
useEffect(() => {
  const socket = io(BACKEND_URL, {
    query: { token: localStorage.getItem("bisleri_token") },
  });

  socket.on("dashboard:kpi-updated", (data) => {
    setKpis(data);
  });

  return () => socket.disconnect();
}, []);
```

---

## 📦 Component Props Flow

### Example: KPI Card Component

```typescript
// component/KpiCard.tsx
interface KPICardProps {
  title: string;                    // "Total Orders Today"
  value: number | string;           // 42
  unit?: string;                    // "orders"
  trend?: number;                   // 12 (percentage)
  trendDirection?: 'up' | 'down';   // 'up'
  color?: 'green' | 'blue' | 'red'; // 'green'
  icon?: React.ReactNode;           // <FiShoppingCart />
}

// Usage in Dashboard
<KPICard
  title="Total Orders Today"
  value={kpis.ordersTodayCount}
  unit="orders"
  trend={kpis.ordersTodayTrend}
  trendDirection={kpis.ordersTodayTrend > 0 ? 'up' : 'down'}
  color="green"
  icon={<FiShoppingCart />}
/>
```

---

## 🗄️ Database Query Patterns

### Pattern 1: Aggregation Queries

```typescript
// Calculate daily revenue
const ordersToday = await prisma.order.aggregate({
  where: {
    createdAt: {
      gte: startOfDay(new Date()),
      lte: endOfDay(new Date()),
    },
  },
  _sum: { totalAmount: true },
  _count: true,
});

const revenue = ordersToday._sum.totalAmount;
const orderCount = ordersToday._count;
```

### Pattern 2: Relationship Queries

```typescript
// Get orders with customer details
const orders = await prisma.order.findMany({
  include: {
    user: {
      // Join User table
      select: {
        name: true,
        email: true,
      },
    },
    orderItems: {
      // Join OrderItem table
      include: {
        product: true, // Join Product table
      },
    },
  },
});
```

### Pattern 3: Filtered Pagination

```typescript
// List products with filters and pagination
const products = await prisma.product.findMany({
  where: {
    AND: [
      { name: { contains: searchTerm, mode: "insensitive" } },
      quantity <= reorderLevel ? { quantity: { lte: 100 } } : {},
    ],
  },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" },
});
```

---

## 📡 API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "ordersTodayCount": 42,
    "ordersTodayAmount": 24500,
    "profitTodayAmount": 6200,
    "profitTodayTrend": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "quantity",
      "message": "Quantity must be greater than 0"
    }
  ]
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    /* array of items */
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 153,
    "pages": 8
  }
}
```

---

## 🔄 Caching Strategy

### Cache Levels

**Level 1: Frontend State (React State/Redux)**

- KPI data: Cache for 5 minutes
- Inventory list: Cache for 2 minutes
- Reports: Cache for 1 hour

**Level 2: Browser API (LocalStorage)**

- User preferences: Persist indefinitely
- Last search filters: Cache for 1 day

**Level 3: Backend API (Redis - Optional)**

- Dashboard KPIs: Cache for 2 minutes
- Frequently accessed reports: Cache for 1 hour
- Product list: Cache for 10 minutes

### Implementation Example

```typescript
// Backend caching with Redis
const getDashboardKPIs = async (req: Request, res: Response) => {
  const cacheKey = "dashboard:kpis";

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  // Calculate KPIs (expensive operation)
  const kpis = {
    /* calculations */
  };

  // Store in cache for 2 minutes
  await redis.setex(cacheKey, 120, JSON.stringify(kpis));

  res.json({ success: true, data: kpis });
};
```

---

## 🧪 Testing Data Flow

### Integration Test Example

```typescript
// test/admin/dashboard.test.ts
describe("Dashboard KPI Flow", () => {
  it("should fetch and display KPIs correctly", async () => {
    // 1. Setup: Create test data
    const order = await createTestOrder({ amount: 1000 });

    // 2. Call API
    const response = await request(app)
      .get("/api/admin/dashboard/kpis")
      .set("Authorization", `Bearer ${testToken}`);

    // 3. Assert response
    expect(response.status).toBe(200);
    expect(response.body.data.ordersTodayCount).toBeGreaterThan(0);
    expect(response.body.data.ordersTodayAmount).toBe(1000);

    // 4. Cleanup
    await deleteTestOrder();
  });
});
```

---

## 📈 Performance Optimization

### Query Optimization

```typescript
// ❌ Inefficient: N+1 queries
const products = await prisma.product.findMany();
products.forEach(async (p) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: p.supplierId },
  });
});

// ✅ Efficient: Single query with include
const products = await prisma.product.findMany({
  include: { supplier: true },
});
```

### Response Optimization

```typescript
// ❌ Inefficient: Returning all fields
const users = await prisma.user.findMany();

// ✅ Efficient: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

---

## 📚 Related Documentation

- [API_ENDPOINTS.md](../API_ENDPOINTS.md) - Complete API specification
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment instructions
- [ADMIN_DASHBOARD_README.md](../ADMIN_DASHBOARD_README.md) - Feature overview

---

**Last Updated:** June 2026  
**Version:** 1.0.0  
**Status:** Production Ready
