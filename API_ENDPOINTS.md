# Bisleri Admin API Endpoints Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All admin endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## 1. DASHBOARD ENDPOINTS

### Get Dashboard KPIs

**Endpoint:** `GET /admin/dashboard/kpis`

**Description:** Fetch all KPI data for dashboard display

**Response:**

```json
{
  "success": true,
  "data": {
    "ordersTodayCount": 42,
    "ordersTodayAmount": 24500,
    "ordersTodayTrend": 12,
    "revenueTodayAmount": 18400,
    "revenueTodayTrend": 8,
    "profitTodayAmount": 6200,
    "profitTodayTrend": 5,
    "activeCustomersCount": 483,
    "activeCustomersTrend": 15,
    "stockValueTotal": 82500,
    "stockValueTrend": -3,
    "lowStockItemsCount": 12,
    "pendingDeliveriesCount": 45,
    "pendingDeliveriesTrend": -5,
    "pendingJarReturnsCount": 8,
    "pendingJarReturnsTrend": 12
  }
}
```

### Get Monthly Stats

**Endpoint:** `GET /admin/dashboard/monthly-stats`

**Description:** Monthly revenue, profit, and trend data

**Query Parameters:**

- `month` (optional): Month number (1-12), defaults to current month
- `year` (optional): Year, defaults to current year

**Response:**

```json
{
  "success": true,
  "data": {
    "revenueThisMonth": 524000,
    "revenueTarget": 600000,
    "revenueProgress": 87,
    "profitThisMonth": 168000,
    "profitMargin": 32,
    "yearToDateRevenue": 3250000,
    "yearToDateProfit": 1040000,
    "averageOrderValue": 1240
  }
}
```

### Get Recent Orders

**Endpoint:** `GET /admin/dashboard/recent-orders`

**Description:** Last N orders for dashboard display

**Query Parameters:**

- `limit` (optional): Number of orders to fetch, default 5

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ORD-001",
      "customerName": "Raj Patel",
      "amount": 850,
      "status": "delivered",
      "deliveryDate": "2026-06-15",
      "items": 3
    }
  ]
}
```

---

## 2. INVENTORY ENDPOINTS

### Get All Products Inventory

**Endpoint:** `GET /admin/inventory/products`

**Description:** List all products with current stock levels

**Query Parameters:**

- `search` (optional): Search by product name or SKU
- `status` (optional): Filter by status (healthy, low, out)
- `page` (optional): Pagination page number, default 1
- `limit` (optional): Items per page, default 20

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_1",
      "name": "20L Water Jar",
      "sku": "W20L-001",
      "openingStock": 500,
      "added": 200,
      "sold": 45,
      "currentStock": 655,
      "reorderLevel": 100,
      "status": "healthy",
      "costPrice": 80,
      "sellingPrice": 140,
      "supplierId": "sup_1"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47
  }
}
```

### Add Stock

**Endpoint:** `POST /admin/inventory/add-stock`

**Description:** Record new stock addition (purchase from supplier)

**Request Body:**

```json
{
  "productId": "prod_1",
  "quantity": 200,
  "costPrice": 80,
  "supplierId": "sup_1",
  "invoiceNumber": "INV-2026-0892",
  "notes": "Bulk purchase from supplier"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Stock added successfully",
  "data": {
    "transactionId": "trans_001",
    "productId": "prod_1",
    "quantity": 200,
    "previousStock": 655,
    "newStock": 855,
    "timestamp": "2026-06-15T10:30:00Z"
  }
}
```

### Get Stock Ledger

**Endpoint:** `GET /admin/inventory/ledger`

**Description:** Complete audit trail of stock movements

**Query Parameters:**

- `productId` (optional): Filter by specific product
- `transactionType` (optional): purchase, sale, return, adjustment, damage, sample
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter
- `page` (optional): Pagination

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ledger_001",
      "date": "2026-06-15",
      "transactionType": "purchase",
      "productId": "prod_1",
      "productName": "20L Water Jar",
      "openingQty": 500,
      "added": 200,
      "sold": 0,
      "returned": 0,
      "closingQty": 700,
      "reference": "PO-2026-0892",
      "supplier": "Fresh Waters Ltd",
      "notes": "Bulk purchase from supplier"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 127
  }
}
```

### Get Stock Forecast

**Endpoint:** `GET /admin/inventory/forecast`

**Description:** Predictive stock analysis with reorder recommendations

**Query Parameters:**

- `productId` (optional): Get forecast for specific product
- `sortBy` (optional): daysRemaining, status

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "forecast_1",
      "productId": "prod_1",
      "productName": "20L Water Jar",
      "currentStock": 45,
      "dailyBurnRate": 35,
      "daysRemaining": 1.3,
      "reorderLevel": 100,
      "recommendedOrderQty": 500,
      "forecastStatus": "critical",
      "lastRestockDate": "2026-06-10",
      "avgDailyUsage": 35
    }
  ]
}
```

### Record Inventory Adjustment

**Endpoint:** `POST /admin/inventory/adjustment`

**Description:** Record stock adjustments (damage, sample, count reconciliation)

**Request Body:**

```json
{
  "productId": "prod_1",
  "adjustmentType": "adjustment",
  "quantity": -2,
  "reason": "Physical count reconciliation",
  "reference": "ADJ-2026-203",
  "notes": "Stock reconciliation - Physical count"
}
```

---

## 3. PROFIT ANALYTICS ENDPOINTS

### Get Profit Report

**Endpoint:** `GET /admin/profit/report`

**Description:** Detailed profit calculation and analysis

**Query Parameters:**

- `startDate` (required): Start date for report
- `endDate` (required): End date for report
- `groupBy` (optional): daily, weekly, monthly

**Response:**

```json
{
  "success": true,
  "data": {
    "periodStart": "2026-06-01",
    "periodEnd": "2026-06-30",
    "totalRevenue": 524000,
    "productCost": 245000,
    "deliveryCost": 52400,
    "operationalCost": 42000,
    "grossProfit": 279000,
    "netProfit": 226600,
    "profitMarginPercent": 43.3,
    "dailyBreakdown": [
      {
        "date": "2026-06-15",
        "revenue": 18400,
        "productCost": 8450,
        "deliveryCost": 1840,
        "operationalCost": 1500,
        "netProfit": 5210,
        "marginPercent": 28.3
      }
    ],
    "productWiseProfit": [
      {
        "productId": "prod_1",
        "productName": "20L Water Jar",
        "revenue": 95000,
        "cost": 35000,
        "profit": 60000,
        "marginPercent": 63.2,
        "unitsSold": 680
      }
    ]
  }
}
```

### Get Monthly Profit Trends

**Endpoint:** `GET /admin/profit/trends/monthly`

**Description:** Monthly profit trends for charts

**Query Parameters:**

- `year` (optional): Year for trends, defaults to current year

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "month": "January",
      "revenue": 420000,
      "cost": 180000,
      "profit": 240000,
      "marginPercent": 57.1
    },
    {
      "month": "February",
      "revenue": 485000,
      "cost": 210000,
      "profit": 275000,
      "marginPercent": 56.7
    }
  ]
}
```

---

## 4. JAR RETURN ENDPOINTS

### Get Jar Return Records

**Endpoint:** `GET /admin/jar-returns`

**Description:** List all customer jar return records

**Query Parameters:**

- `status` (optional): complete, partial, pending
- `search` (optional): Search by customer name
- `overdueOnly` (optional): true/false, show only overdue returns
- `page` (optional): Pagination

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "jar_001",
      "customerId": "cust_1",
      "customerName": "Raj Patel",
      "jarsIssued": 10,
      "jarsReturned": 7,
      "pendingJars": 3,
      "depositAmount": 5000,
      "outstandingDeposit": 1500,
      "returnStatus": "partial",
      "lastReturnDate": "2026-06-10",
      "daysOverdue": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 89
  }
}
```

### Record Jar Return

**Endpoint:** `POST /admin/jar-returns/record-return`

**Description:** Record jars returned by customer

**Request Body:**

```json
{
  "customerId": "cust_1",
  "jarsReturned": 3,
  "depositRefunded": 1500,
  "notes": "Customer returned 3 damaged jars"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Jar return recorded successfully",
  "data": {
    "recordId": "ret_001",
    "customerId": "cust_1",
    "jarsReturned": 3,
    "depositRefunded": 1500,
    "timestamp": "2026-06-15T14:20:00Z"
  }
}
```

### Get Jar Return Statistics

**Endpoint:** `GET /admin/jar-returns/stats`

**Description:** Summary statistics for jar returns

**Response:**

```json
{
  "success": true,
  "data": {
    "totalJarsIssued": 2450,
    "totalJarsReturned": 2180,
    "pendingJarsTrace": 270,
    "totalOutstandingDeposit": 135000,
    "overdueReturns": 15,
    "completionRate": 89.0
  }
}
```

---

## 5. REPORTS ENDPOINTS

### Generate Report

**Endpoint:** `POST /admin/reports/generate`

**Description:** Generate and download reports in various formats

**Request Body:**

```json
{
  "reportType": "inventory|revenue|profit|customer|jar-return|delivery|monthly-summary",
  "format": "excel|pdf|csv",
  "startDate": "2026-06-01",
  "endDate": "2026-06-30",
  "filters": {
    "productId": "optional",
    "supplierId": "optional",
    "customerId": "optional"
  }
}
```

**Response:**

- Returns file stream for download
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (for Excel)
- Content-Type: application/pdf (for PDF)
- Content-Type: text/csv (for CSV)

### Get Report History

**Endpoint:** `GET /admin/reports/history`

**Description:** List previously generated reports

**Query Parameters:**

- `limit` (optional): Number of reports, default 50

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "report_001",
      "reportType": "monthly_summary",
      "format": "PDF",
      "generatedDate": "2026-05-31T16:45:00Z",
      "userId": "user_1",
      "userName": "Admin User",
      "fileUrl": "/reports/report_001.pdf",
      "fileSize": 2048000
    }
  ]
}
```

---

## 6. PRODUCT ENDPOINTS

### Get All Products (Admin)

**Endpoint:** `GET /admin/products`

**Description:** List all products with detailed information

**Query Parameters:**

- `search` (optional): Search term
- `category` (optional): Filter by category
- `status` (optional): active, inactive
- `page` (optional): Pagination

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_1",
      "name": "20L Water Jar",
      "sku": "W20L-001",
      "category": "Water Jars",
      "costPrice": 80,
      "sellingPrice": 140,
      "currentStock": 655,
      "reorderLevel": 100,
      "supplierId": "sup_1",
      "supplierName": "Fresh Waters Ltd",
      "description": "Premium 20L water jar",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47
  }
}
```

### Create Product

**Endpoint:** `POST /admin/products`

**Request Body:**

```json
{
  "name": "25L Water Jar",
  "sku": "W25L-001",
  "category": "Water Jars",
  "costPrice": 95,
  "sellingPrice": 165,
  "reorderLevel": 80,
  "supplierId": "sup_1",
  "description": "Premium 25L water jar"
}
```

### Update Product

**Endpoint:** `PUT /admin/products/:id`

### Delete Product

**Endpoint:** `DELETE /admin/products/:id`

---

## 7. ORDER MANAGEMENT ENDPOINTS

### Get Orders (Admin)

**Endpoint:** `GET /admin/orders`

**Query Parameters:**

- `status` (optional): pending, confirmed, dispatched, delivered, cancelled
- `startDate` (optional): Filter by date range
- `endDate` (optional): Filter by date range
- `customerId` (optional): Filter by customer
- `page` (optional): Pagination

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ORD-001",
      "orderNumber": "ORD-2026-12854",
      "customerId": "cust_1",
      "customerName": "Raj Patel",
      "createdDate": "2026-06-15",
      "totalAmount": 850,
      "items": 3,
      "status": "delivered",
      "paymentStatus": "paid",
      "deliveryDate": "2026-06-15"
    }
  ]
}
```

---

## 8. CUSTOMER ENDPOINTS

### Get All Customers (Admin)

**Endpoint:** `GET /admin/customers`

**Query Parameters:**

- `search` (optional): Search by name or email
- `status` (optional): active, inactive
- `page` (optional): Pagination

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cust_1",
      "name": "Raj Patel",
      "email": "raj@example.com",
      "phone": "9876543210",
      "totalOrders": 15,
      "totalSpent": 12750,
      "lastOrderDate": "2026-06-15",
      "status": "active"
    }
  ]
}
```

### Get Customer Details

**Endpoint:** `GET /admin/customers/:id`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cust_1",
    "name": "Raj Patel",
    "email": "raj@example.com",
    "phone": "9876543210",
    "createdDate": "2025-01-15",
    "totalOrders": 15,
    "totalSpent": 12750,
    "avgOrderValue": 850,
    "lastOrderDate": "2026-06-15",
    "jarsIssued": 10,
    "jarsReturned": 7,
    "outstandingDeposit": 1500,
    "purchaseHistory": [
      {
        "orderId": "ORD-001",
        "date": "2026-06-15",
        "amount": 850,
        "status": "delivered"
      }
    ]
  }
}
```

---

## Error Handling

All endpoints follow standard error response format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400 | 401 | 403 | 404 | 500,
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error"
    }
  ]
}
```

### Error Status Codes:

- `400`: Bad Request - Missing or invalid parameters
- `401`: Unauthorized - Invalid or missing JWT token
- `403`: Forbidden - User doesn't have permission
- `404`: Not Found - Resource not found
- `500`: Server Error - Internal server error

---

## Authentication Error Example

```json
{
  "success": false,
  "message": "Unauthorized - Invalid token",
  "statusCode": 401
}
```

---

## Implementation Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All currency values are in the lowest unit (e.g., rupees)
3. Pagination defaults: page=1, limit=20
4. Search is case-insensitive
5. Date filters use ISO 8601 format (YYYY-MM-DD)
6. All list endpoints support sorting and filtering
7. Admin role required for all endpoints (verified via JWT token payload)
