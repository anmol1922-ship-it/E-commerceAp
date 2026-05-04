# E-Commerce Application

A full-stack e-commerce application built with React (Frontend) and Node.js Express (Backend).

## Project Overview

This project includes:

- **Frontend**: Modern React application with Vite, TypeScript, and responsive UI
- **Backend**: RESTful API built with Express, MongoDB, and JWT authentication
- **Database**: MongoDB for storing products, users, and orders
- **Authentication**: JWT-based user authentication and authorization

## Project Structure

```
E-commerceAp/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── App.tsx          # Main application component
│   │   ├── App.css          # Application styles
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Frontend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite configuration
│   └── .env                 # Environment variables
│
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── index.ts         # Server entry point
│   │   ├── models/          # Database models
│   │   │   ├── Product.ts   # Product model
│   │   │   ├── User.ts      # User model
│   │   │   └── Order.ts     # Order model
│   │   ├── routes/          # API routes
│   │   │   ├── products.ts  # Product endpoints
│   │   │   ├── auth.ts      # Authentication endpoints
│   │   │   └── orders.ts    # Order endpoints
│   │   └── middleware/      # Custom middleware
│   │       └── auth.ts      # Auth middleware
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   └── .env                 # Environment variables
│
└── .github/
    └── copilot-instructions.md  # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local or cloud instance)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create or update `.env` file:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Update `.env` file:

```
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The API server will run on `http://localhost:3000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The React application will run on `http://localhost:5173`

## Available Scripts

### Backend

- `npm run dev` - Start development server with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled application
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Jest

### Frontend

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Orders

- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:id` - Get order by ID (requires auth)
- `POST /api/orders` - Create new order (requires auth)

## Features

### Frontend

- Product listing with search and filtering
- Shopping cart functionality
- User authentication
- Responsive design
- Real-time cart updates

### Backend

- RESTful API with proper error handling
- User authentication with JWT
- Product management
- Order management
- Input validation
- CORS support

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- CSS3 (Custom styling)
- Fetch API

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS

## Environment Variables

### Backend (.env)

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000/api
```

## Database Models

### Product

- `name` (String, required)
- `description` (String, required)
- `price` (Number, required)
- `stock` (Number, default: 0)
- `category` (String, required)
- `imageUrl` (String)
- `createdAt` (Date, auto)
- `updatedAt` (Date, auto)

### User

- `email` (String, unique, required)
- `password` (String, hashed, required)
- `firstName` (String, required)
- `lastName` (String, required)
- `phone` (String)
- `address` (String)
- `createdAt` (Date, auto)
- `updatedAt` (Date, auto)

### Order

- `userId` (ObjectId, required)
- `items` (Array of products with quantity and price)
- `totalAmount` (Number, required)
- `status` (String: pending, completed, cancelled)
- `shippingAddress` (String, required)
- `createdAt` (Date, auto)
- `updatedAt` (Date, auto)

## Development Workflow

1. Start MongoDB locally or use a cloud instance
2. Start the backend server with `npm run dev`
3. In another terminal, start the frontend with `npm run dev`
4. Open `http://localhost:5173` in your browser
5. Use the API endpoints as documented above

## Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Email notifications
- Product reviews and ratings
- Wishlist functionality
- Admin dashboard
- Inventory management
- Advanced search and filtering
- User profile management
- Order tracking

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running locally or provide a valid cloud connection string
- Check `MONGODB_URI` in the `.env` file

### CORS Errors

- Ensure backend is running on port 3000
- Check `VITE_API_URL` in frontend `.env` file

### Port Already in Use

- Change `PORT` in backend `.env` file
- Use `sudo lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows) to find the process

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

**Last Updated**: May 2, 2026
**Version**: 1.0.0
