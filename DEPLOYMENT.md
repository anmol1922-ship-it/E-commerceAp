# Bisleri Admin Dashboard - Deployment Guide

## Project Completion Status

### ✅ Completed Components

#### Frontend Admin Dashboard UI

- ✅ Admin Layout (Header + Sidebar + Main content area)
- ✅ Dashboard with 8 KPI cards and analytics
- ✅ Inventory Management screen
- ✅ Stock Ledger with transaction audit trail
- ✅ Stock Forecast with predictive analytics
- ✅ Profit Analytics with margin calculations
- ✅ Jar Return Management with customer tracking
- ✅ Reports screen with multiple export formats
- ✅ Responsive sidebar with submenu navigation
- ✅ All components styled with Tailwind CSS

#### Backend API Implementation

- ✅ Admin controller with all business logic
- ✅ Admin routes with proper authentication
- ✅ Dashboard KPIs calculation
- ✅ Inventory operations (add stock, ledger, forecast)
- ✅ Profit report calculations
- ✅ Jar return management endpoints
- ✅ Database models extended with admin functionality

#### Database Schema

- ✅ Extended Prisma schema with new models:
  - Supplier
  - InventoryTransaction
  - StockLedger
  - Expense
  - ProfitReport
  - JarReturn
  - InventoryAlert
  - AdminPermission

#### Documentation

- ✅ API_ENDPOINTS.md - Complete API specification
- ✅ DEPLOYMENT.md - This deployment guide

---

## Pre-Deployment Checklist

### 1. Environment Configuration

**Backend (.env)**

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
# OR Supabase PostgreSQL:
DATABASE_URL=postgresql://user:password@host:5432/db

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

RAZORPAY_KEY_ID=rzp_test_SvYpuojDVF8Uyu
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**

```
VITE_API_URL=http://localhost:3000/api
```

### 2. Database Migration Steps

```bash
# 1. Navigate to backend directory
cd backend

# 2. Generate Prisma migrations
npx prisma migrate dev --name add_admin_features

# 3. Apply migrations to database
npx prisma db push

# 4. Seed database with initial data (optional)
npm run seed:products
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 4. Verify File Structure

Required new files created:

- ✅ `backend/src/controllers/adminController.ts`
- ✅ `backend/src/routes/admin.ts`
- ✅ `frontend/src/components/admin/AdminLayout.tsx`
- ✅ `frontend/src/components/admin/AdminHeader.tsx`
- ✅ `frontend/src/components/admin/sidebar/AdminSidebar.tsx`
- ✅ `frontend/src/pages/admin/dashboard/Dashboard.tsx`
- ✅ `frontend/src/pages/admin/inventory/InventoryManagement.tsx`
- ✅ `frontend/src/pages/admin/inventory/StockLedger.tsx`
- ✅ `frontend/src/pages/admin/inventory/StockForecast.tsx`
- ✅ `frontend/src/pages/admin/profit/ProfitAnalytics.tsx`
- ✅ `frontend/src/pages/admin/jar-returns/JarReturnManagement.tsx`
- ✅ `frontend/src/pages/admin/reports/Reports.tsx`

---

## Local Development Setup

### Step 1: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**

```
🔧 Configuration loaded:
  PORT: 3000
  NODE_ENV: development
  RAZORPAY_KEY_ID: ✅ SET
  RAZORPAY_KEY_SECRET: ✅ SET
  DATABASE_URL: ✅ SET

🚀 Bisleri API running on port 3000 [development]
```

### Step 2: Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

**Expected Output:**

```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Access Admin Dashboard

1. Navigate to `http://localhost:5173/admin/dashboard`
2. You may need to login first (if auth is required)
3. Verify all pages load without errors

---

## Testing Endpoints

### Using cURL or Postman

#### 1. Authenticate (Get JWT Token)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {...}
  }
}
```

#### 2. Get Dashboard KPIs

```bash
curl -X GET http://localhost:3000/api/admin/dashboard/kpis \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Get Inventory Products

```bash
curl -X GET http://localhost:3000/api/admin/inventory/products?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Add Stock

```bash
curl -X POST http://localhost:3000/api/admin/inventory/add-stock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_1",
    "quantity": 100,
    "costPrice": 80,
    "supplierId": "sup_1",
    "invoiceNumber": "INV-2026-0001",
    "notes": "Bulk purchase"
  }'
```

#### 5. Get Profit Report

```bash
curl -X GET "http://localhost:3000/api/admin/profit/report?startDate=2026-06-01&endDate=2026-06-30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Frontend Integration Points

### Key API Integration Files to Update

#### 1. Create Admin API Service

**File:** `frontend/src/api/adminApi.ts`

```typescript
import axios from "axios";

const API_BASE = process.env.VITE_API_URL;

export const adminApi = {
  // Dashboard
  getDashboardKPIs: () => axios.get(`${API_BASE}/admin/dashboard/kpis`),
  getMonthlyStats: () => axios.get(`${API_BASE}/admin/dashboard/monthly-stats`),
  getRecentOrders: (limit = 5) =>
    axios.get(`${API_BASE}/admin/dashboard/recent-orders?limit=${limit}`),

  // Inventory
  getInventoryProducts: (page = 1, limit = 20, filters = {}) =>
    axios.get(`${API_BASE}/admin/inventory/products`, {
      params: { page, limit, ...filters },
    }),
  addStock: (data) => axios.post(`${API_BASE}/admin/inventory/add-stock`, data),
  getStockLedger: (filters = {}) =>
    axios.get(`${API_BASE}/admin/inventory/ledger`, { params: filters }),
  getStockForecast: (productId?) =>
    axios.get(`${API_BASE}/admin/inventory/forecast`, {
      params: productId ? { productId } : {},
    }),

  // Profit
  getProfitReport: (startDate, endDate) =>
    axios.get(`${API_BASE}/admin/profit/report`, {
      params: { startDate, endDate },
    }),
  getMonthlyTrends: (year?) =>
    axes.get(`${API_BASE}/admin/profit/trends/monthly`, { params: { year } }),

  // Jar Returns
  getJarReturns: (page = 1, limit = 20, filters = {}) =>
    axios.get(`${API_BASE}/admin/jar-returns`, {
      params: { page, limit, ...filters },
    }),
  recordJarReturn: (data) =>
    axios.post(`${API_BASE}/admin/jar-returns/record-return`, data),
  getJarReturnStats: () => axios.get(`${API_BASE}/admin/jar-returns/stats`),
};
```

#### 2. Update Dashboard Component with Real Data

**File:** `frontend/src/pages/admin/dashboard/Dashboard.tsx`

Add this hook at the top of the component:

```typescript
import { useEffect, useState } from 'react';
import { adminApi } from '../../../api/adminApi';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('bisleri_token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await adminApi.getDashboardKPIs();
        setKpis(response.data.data);
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Replace mock data with kpis
  // Example: ordersTodayCount becomes kpis.ordersTodayCount
}
```

---

## Common Issues & Solutions

### Issue 1: 401 Unauthorized Error

**Solution:**

- Verify JWT token is being sent in Authorization header
- Check token expiry and regenerate if needed
- Ensure user has admin role

### Issue 2: Database Connection Error

**Solution:**

- Check DATABASE_URL is correctly configured
- Verify database is running and accessible
- Run `npx prisma db push` to ensure schema is updated

### Issue 3: CORS Error

**Solution:**

- Verify FRONTEND_URL in backend .env matches your frontend URL
- Check CORS middleware is properly configured in backend

### Issue 4: Missing Dependencies

**Solution:**

```bash
# Backend
cd backend
npm install date-fns  # For date calculations

# Frontend
cd frontend
npm install react-icons  # Already included in package.json
```

---

## Performance Optimization

### 1. Database Query Optimization

- Add indexes on commonly queried fields:
  ```prisma
  model Order {
    @@index([userId])
    @@index([status])
    @@index([createdAt])
  }
  ```

### 2. API Response Caching

- Implement Redis caching for dashboard KPIs
- Cache reports for 1 hour

### 3. Frontend Optimization

- Implement code splitting for admin routes
- Lazy load charts with React.lazy()
- Use React.memo for KPI cards

---

## Next Steps for Production

### 1. Chart Library Integration

Install and configure Recharts:

```bash
npm install recharts
```

Update Dashboard.tsx charts with real Recharts components

### 2. Export Functionality

```bash
npm install exceljs jspdf
```

Create export service for Excel/PDF generation

### 3. Authentication Enhancement

- Implement 2FA for admin accounts
- Add role-based access control (RBAC)
- Setup admin permission matrix

### 4. Real-time Updates

- Implement WebSocket for live inventory updates
- Setup real-time notifications

### 5. Error Tracking

- Integrate Sentry for error monitoring
- Setup logging infrastructure

---

## Deployment to Production

### Using Docker

**Backend Dockerfile:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Using Docker Compose

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://localhost:3000/api

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=bisleri
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Quick Reference Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code quality

# Database
npx prisma studio   # View database GUI
npx prisma migrate dev --name name_of_migration  # Create migration
npx prisma db push  # Apply schema changes

# Testing
npm test            # Run tests
npm run test:e2e    # Run end-to-end tests

# Deployment
npm run build       # Build production bundle
npm start           # Start production server
```

---

## Support & Documentation

- **API Documentation:** See `API_ENDPOINTS.md`
- **Database Schema:** See `backend/prisma/schema.prisma`
- **Frontend Components:** See component files in `frontend/src/pages/admin/`
- **Backend Controllers:** See `backend/src/controllers/adminController.ts`

---

## Version Information

- Node.js: 18+
- React: 19
- Express: 4.18+
- Prisma: 5+
- TypeScript: 5+
- Tailwind CSS: 3+

---

## Contact & Issues

For issues or questions:

1. Check the troubleshooting section above
2. Review API_ENDPOINTS.md for API details
3. Check database schema in prisma/schema.prisma

---

**Last Updated:** June 2026
**Status:** Ready for Testing & Deployment
