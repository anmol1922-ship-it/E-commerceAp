# Bisleri Water Delivery - Vasai, Maharashtra

A production-ready full-stack e-commerce application for ordering Bisleri mineral water in Vasai.

## Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 19, React Router, Redux Toolkit, Tailwind CSS v4 |
| Backend    | Node.js, Express.js, TypeScript                        |
| Database   | MongoDB with Mongoose                                  |
| Auth       | JWT + bcrypt                                           |
| Payment    | Razorpay                                               |
| Deployment | Docker, Docker Compose                                 |

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Razorpay account (for payment testing)

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env   # edit with your MongoDB URI & Razorpay keys
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Seed Database

```bash
cd backend
npm run seed
```

This creates 8 Bisleri products and an admin user:

- **Admin:** admin@bisleri-vasai.com / admin123

### 3. Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

### 4. Docker (Production)

```bash
docker-compose up --build
```

App available at http://localhost:5000

## Products

| Product                 | Price |
| ----------------------- | ----- |
| 20L Water Jar           | ₹100  |
| 10L Water Jar           | ₹125  |
| 5L Water Jar            | ₹75   |
| 2L Case (9 bottles)     | ₹180  |
| 1L Case (12 bottles)    | ₹240  |
| 500ml Case (24 bottles) | ₹240  |
| 250ml Case (48 bottles) | ₹290  |
| 200ml Case (48 bottles) | ₹260  |

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/address`

### Products

- `GET /api/products` — filter by category, price, search, sort
- `GET /api/products/slug/:slug`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Cart

- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/item/:productId`
- `DELETE /api/cart/clear`

### Orders

- `POST /api/orders`
- `POST /api/orders/verify-payment`
- `GET /api/orders/my-orders`
- `GET /api/orders/my-orders/:id`
- `GET /api/orders/admin/all` (admin)
- `PUT /api/orders/admin/:id/status` (admin)
- `GET /api/orders/admin/dashboard` (admin)

## Features

- Landing page with hero, products, testimonials
- Product catalog with filtering, sorting, search
- Persistent cart with GST & delivery calculation
- Vasai pincode validation
- Delivery slot selection
- Razorpay payment integration
- Cash on Delivery option
- JWT authentication (register/login)
- User profile & order history
- Admin dashboard (stats, products, orders management)
- Mobile-responsive design
- Toast notifications
- Skeleton loading states
- Rate limiting, Helmet, CORS, Compression
- Docker deployment ready

## Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bisleri
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=/api
```

## Folder Structure

```
├── backend/
│   └── src/
│       ├── config/        # DB connection, environment config
│       ├── controllers/   # Route handlers
│       ├── middleware/     # Auth, validation, error handling
│       ├── models/        # Mongoose schemas
│       ├── routes/        # Express routes
│       ├── scripts/       # Seed scripts
│       ├── utils/         # Logger
│       └── index.ts       # App entry point
├── frontend/
│   └── src/
│       ├── api/           # Axios config
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       │   └── admin/     # Admin panel pages
│       └── store/         # Redux store & slices
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## License

Private — Bisleri Water Delivery, Vasai
