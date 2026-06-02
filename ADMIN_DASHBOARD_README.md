# Bisleri Admin Dashboard - Comprehensive Guide

## 📊 Overview

The Bisleri Admin Dashboard is an enterprise-grade business intelligence and management platform designed specifically for the water delivery industry. It provides real-time analytics, inventory management, profit tracking, and customer management capabilities for business administrators.

### Vision

Inspired by industry leaders like Amazon Seller Central, Blinkit Admin, Shopify, and Zepto merchant dashboards, this admin panel brings professional-grade analytics and operations management to the Bisleri ecommerce platform.

---

## 🎯 Key Features

### 1. **Executive Dashboard**

- 8 critical KPI cards with trend indicators
- Real-time metrics:
  - Orders & Revenue (Today/Monthly)
  - Profit calculations with margin analysis
  - Active customer count
  - Stock value & inventory status
  - Pending deliveries & jar return tracking
- Monthly trends and year-to-date analytics
- Recent orders summary table

### 2. **Inventory Management Suite**

#### Stock Levels

- Complete product inventory overview
- Current stock vs. reorder level
- Status indicators (Healthy/Low/Out of Stock)
- Color-coded stock cards
- Search and filtering capabilities

#### Stock Ledger (Audit Trail)

- Complete transaction history
- Transaction types: Purchase, Sale, Return, Adjustment, Damage, Sample
- Daily opening/closing stock balances
- Reference tracking
- Expandable transaction details
- Filter by date range, transaction type, product

#### Stock Forecast (Predictive Analytics)

- Remaining days of stock calculation
- Daily burn rate analysis
- Automatic reorder recommendations
- Status-based organization (Critical/Warning/Adequate/Excess)
- Progress bars for visual representation
- Days overdue highlighting

### 3. **Profit Analytics**

- Comprehensive profit breakdown:
  - Gross Profit (Revenue - Product Cost)
  - Net Profit (Gross - Delivery - Operational)
  - Profit Margin % with target vs actual
- Monthly profit trends
- Product-wise profit analysis
- Customizable date range filtering
- Visual profit cards with color gradients
- Progress bar indicators

### 4. **Jar Return Management**

- Customer-wise jar tracking:
  - Jars issued vs. returned
  - Outstanding deposits
  - Days overdue alerts
- Return status: Complete/Partial/Pending
- Deposit refund tracking
- Overdue case highlighting (>15 days)
- Return recording modal
- Summary statistics

### 5. **Reports & Export**

- Multi-format report generation:
  - Inventory Report (Excel/PDF/CSV)
  - Stock Movement Report
  - Revenue Report
  - Profit Report
  - Customer Purchase Report
  - Jar Return Report
  - Delivery Report
  - Monthly Summary
- Date range filtering
- Download history tracking
- Quick export buttons

---

## 🏗️ System Architecture

### Frontend Stack

```
React 19 + TypeScript
├── Components/
│   ├── Admin Layout (wrapper)
│   ├── Admin Header (user profile, notifications)
│   └── Admin Sidebar (navigation)
├── Pages/
│   ├── Dashboard/
│   ├── Inventory/
│   │   ├── InventoryManagement.tsx
│   │   ├── StockLedger.tsx
│   │   └── StockForecast.tsx
│   ├── Profit/
│   │   └── ProfitAnalytics.tsx
│   ├── Jar-Returns/
│   │   └── JarReturnManagement.tsx
│   └── Reports/
│       └── Reports.tsx
└── API/
    └── adminApi.ts (API integration layer)
```

### Backend Stack

```
Express.js + TypeScript
├── Controllers/
│   └── adminController.ts (Business logic)
├── Routes/
│   └── admin.ts (API endpoints)
├── Middleware/
│   ├── auth.ts (JWT verification)
│   └── validators.ts (Input validation)
└── Models/
    ├── Order
    ├── Product
    ├── User
    ├── Supplier
    ├── InventoryTransaction
    ├── JarReturn
    └── Others...
```

### Database Schema

```
Prisma ORM with PostgreSQL
├── Core Models
│   ├── User (roles: customer, admin, manager, inventory_manager, etc.)
│   ├── Product (with costPrice, reorderLevel)
│   ├── Order & OrderItem
│   └── Cart & CartItem
├── Inventory Models
│   ├── InventoryTransaction (audit trail)
│   ├── StockLedger (daily balances)
│   ├── Supplier
│   └── InventoryAlert
├── Profit Models
│   ├── Expense (operational costs)
│   └── ProfitReport (monthly summaries)
└── Customer Models
    └── JarReturn (deposit tracking)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL or MongoDB
- npm or yarn
- Git

### Installation

1. **Clone Repository**

```bash
git clone https://github.com/yourusername/bisleri-ecommerce.git
cd bisleri-ecommerce
```

2. **Backend Setup**

```bash
cd backend
npm install
# Configure .env file
npx prisma migrate dev
npm run dev
```

3. **Frontend Setup**

```bash
cd frontend
npm install
# Configure .env file
npm run dev
```

4. **Access Dashboard**

```
http://localhost:5173/admin/dashboard
```

---

## 📊 Dashboard Screens

### Dashboard Home

**Route:** `/admin/dashboard`

**Components:**

- KPI Cards (8x): Orders, Revenue, Profit, Customers, Stock, Sales metrics
- Monthly Statistics: Revenue target progress, profit margin
- Recent Orders: Quick view of latest transactions
- Interactive charts (ready for implementation)

**Key Metrics Displayed:**

- Today's order count & amount
- Revenue with trend indicators
- Profit calculations
- Active customer count
- Total stock value
- Low stock items count
- Pending deliveries
- Pending jar returns

---

### Inventory Management

**Route:** `/admin/dashboard/inventory`

**Features:**

- Product listing with pagination
- Real-time search (product name, SKU)
- Stock status filtering
- Add Stock modal:
  - Product selection
  - Quantity input
  - Purchase cost tracking
  - Supplier selection
  - Invoice reference
  - Notes field
- Status badges with color coding
- Export to Excel

---

### Stock Ledger

**Route:** `/admin/dashboard/inventory/ledger`

**Features:**

- Complete transaction history
- 6 transaction types supported
- Expandable row details showing:
  - Supplier information
  - Notes and references
  - Quantity changes
- Filter by:
  - Date range
  - Transaction type
  - Product
- Opening/Closing quantity tracking
- Reference tracking (PO, Invoice, etc.)
- Export capability

---

### Stock Forecast

**Route:** `/admin/dashboard/inventory/forecast`

**Features:**

- Predictive stock analysis
- Color-coded forecast cards:
  - Red (Critical - <2 days)
  - Orange (Warning - 2-7 days)
  - Green (Adequate - 7-45 days)
  - Blue (Excess - >45 days)
- Key metrics per product:
  - Current stock
  - Daily burn rate
  - Days remaining
  - Reorder level
  - Recommended order quantity
- Summary statistics
- Search and sort functionality
- Order Now button for critical items

---

### Profit Analytics

**Route:** `/admin/dashboard/profit`

**Features:**

- Date range selection (month/year)
- Profit breakdown cards:
  - Total Revenue
  - Product Cost
  - Delivery Cost
  - Operational Cost
  - Gross & Net Profit
- Profit margin progress bar
- Profit target vs actual comparison
- Monthly trend visualization
- Product-wise profit breakdown
- Margin percentage calculations

---

### Jar Return Management

**Route:** `/admin/dashboard/jar-returns`

**Features:**

- Customer jar tracking table
- Return status indicators:
  - Complete (Green)
  - Partial (Yellow)
  - Pending (Red)
- Tracking fields:
  - Jars issued vs returned
  - Outstanding deposits
  - Days overdue
  - Last return date
- Record Return modal:
  - Customer selection
  - Jars returned input
  - Deposit refund tracking
  - Notes
- Overdue alerts (>15 days)
- Summary statistics:
  - Total jars issued
  - Total jars returned
  - Outstanding deposits
  - Overdue cases

---

### Reports

**Route:** `/admin/dashboard/reports`

**Features:**

- 8 Report types available:
  - Inventory Report
  - Stock Movement Report
  - Revenue Report
  - Profit Report
  - Customer Purchase Report
  - Jar Return Report
  - Delivery Report
  - Monthly Summary Report
- Multi-format export:
  - Excel (.xlsx)
  - PDF
  - CSV (where applicable)
- Date range filtering
- Download history
- Recently generated reports list
- Export status tracking

---

## 🔌 API Integration

### Base Endpoint

```
http://localhost:3000/api/admin
```

### Authentication

All requests require JWT token in header:

```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Dashboard

```
GET /admin/dashboard/kpis              - Fetch KPI data
GET /admin/dashboard/monthly-stats     - Monthly statistics
GET /admin/dashboard/recent-orders     - Recent orders list
```

#### Inventory

```
GET /admin/inventory/products          - List products inventory
POST /admin/inventory/add-stock        - Add stock (purchase)
GET /admin/inventory/ledger            - Transaction history
GET /admin/inventory/forecast          - Predictive analysis
```

#### Profit

```
GET /admin/profit/report               - Profit analysis
GET /admin/profit/trends/monthly       - Monthly trends
```

#### Jar Returns

```
GET /admin/jar-returns                 - Get jar returns
POST /admin/jar-returns/record-return  - Record return
GET /admin/jar-returns/stats           - Statistics
```

See `API_ENDPOINTS.md` for complete API documentation.

---

## 🎨 UI/UX Design System

### Color Palette

- **Primary:** Emerald (#10b981)
- **Status Success:** Green (#10b981)
- **Status Warning:** Orange (#f97316)
- **Status Error:** Red (#ef4444)
- **Status Neutral:** Gray (#6b7280)
- **Info:** Blue (#3b82f6)

### Component Library

- React Icons (FiX icons)
- Tailwind CSS utilities
- Custom components:
  - KPI Cards
  - Status Badges
  - Data Tables
  - Modal Dialogs
  - Progress Bars
  - Trend Indicators

### Responsive Design

- Mobile-first approach
- Grid system (1 → 2 → 3 → 4 columns)
- Sidebar collapse on mobile
- Touch-friendly spacing

---

## 📈 Business Calculations

### Profit Calculation

```
Gross Profit = Revenue - Product Cost
Net Profit = Gross Profit - Delivery Cost - Operational Cost
Profit Margin % = (Net Profit / Revenue) × 100
```

### Stock Forecast

```
Daily Burn Rate = Units Sold / Days (avg last 30 days)
Days Remaining = Current Stock / Daily Burn Rate
Recommended Order = (Target Days × Daily Burn Rate) - Current Stock
```

### KPI Trends

```
Trend % = ((Today - Yesterday) / Yesterday) × 100
```

---

## 🔒 Security Features

- JWT-based authentication
- Admin role verification
- Request validation middleware
- Error handling
- CORS protection
- Rate limiting
- Helmet.js security headers

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**

```
PORT=3000
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**

```
VITE_API_URL=http://localhost:3000/api
```

---

## 📋 Feature Roadmap

### Phase 1 (Current)

- ✅ Dashboard with KPIs
- ✅ Inventory management
- ✅ Stock ledger
- ✅ Stock forecast
- ✅ Profit analytics
- ✅ Jar return management
- ✅ Reports interface

### Phase 2 (In Progress)

- 🔄 Real data integration
- 🔄 Chart visualizations
- 🔄 Export functionality
- 🔄 Role-based access control

### Phase 3 (Planned)

- 📋 Real-time updates (WebSocket)
- 📋 Advanced filtering
- 📋 Custom report builder
- 📋 Predictive analytics
- 📋 Customer behavior analysis

---

## 🧪 Testing

### Manual Testing Checklist

#### Dashboard

- [ ] All KPI cards load without errors
- [ ] Trend indicators display correctly
- [ ] Recent orders table shows latest orders
- [ ] Date filters work properly

#### Inventory

- [ ] Products list paginates correctly
- [ ] Search functionality works
- [ ] Status badges show correct colors
- [ ] Add Stock modal submits successfully

#### Stock Ledger

- [ ] Transactions display with all details
- [ ] Expandable rows show full information
- [ ] Filters work for date range and type
- [ ] Export buttons are functional

#### Stock Forecast

- [ ] Forecast status colors are accurate
- [ ] Days remaining calculations are correct
- [ ] Reorder recommendations are reasonable
- [ ] Search and sort work properly

#### Profit Analytics

- [ ] Profit calculations are accurate
- [ ] Margin percentages display correctly
- [ ] Monthly trends show progression
- [ ] Product-wise breakdown is detailed

#### Jar Returns

- [ ] Customer list populates correctly
- [ ] Return status badges are accurate
- [ ] Overdue highlighting works
- [ ] Record return modal functions

---

## 🐛 Troubleshooting

### Common Issues

#### Dashboard KPIs not loading

**Solution:** Verify database connection and admin routes are registered

#### Inventory add stock fails

**Solution:** Check product exists and all required fields are provided

#### Charts not rendering

**Solution:** Install `recharts` and configure chart components

#### Export functionality not working

**Solution:** Install `exceljs` and implement export service

---

## 📚 Additional Resources

- [API_ENDPOINTS.md](../API_ENDPOINTS.md) - Complete API documentation
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide
- [Prisma Schema](../backend/prisma/schema.prisma) - Database schema
- [Admin Controller](../backend/src/controllers/adminController.ts) - Backend logic
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 👥 Contributing

To contribute to the admin dashboard:

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Ensure all tests pass

---

## 📄 License

This project is proprietary and for Bisleri use only.

---

## 📞 Support

For issues or questions:

- Create an issue in the repository
- Contact the development team
- Review API documentation
- Check deployment guide

---

**Version:** 1.0.0  
**Last Updated:** June 2026  
**Status:** Production Ready  
**Author:** Bisleri Development Team

---

## Quick Links

- 🏠 [Main Dashboard](http://localhost:5173/admin/dashboard)
- 📦 [Inventory](http://localhost:5173/admin/dashboard/inventory)
- 📊 [Profit Analytics](http://localhost:5173/admin/dashboard/profit)
- 🔄 [Jar Returns](http://localhost:5173/admin/dashboard/jar-returns)
- 📋 [Reports](http://localhost:5173/admin/dashboard/reports)
- 🔗 [API Base](http://localhost:3000/api/admin)
