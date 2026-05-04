<!-- Project-specific instructions for Copilot -->

# E-Commerce Application - Setup Guide

This is a full-stack e-commerce application with React frontend and Node.js Express backend.

## Project Structure

- `frontend/` - React application (Vite + TypeScript)
- `backend/` - Node.js Express server (TypeScript)
- Root level configuration files
- `README.md` - Comprehensive project documentation

## Setup Progress

- [x] Project initialized
- [x] Frontend scaffolding complete
- [x] Backend scaffolding complete
- [x] Dependencies installed
- [x] Development environment ready
- [x] API routes created (Products, Auth, Orders)
- [x] Database models configured (Product, User, Order)
- [x] Frontend components built (App.tsx, styling)
- [x] Environment configuration files set up
- [x] Documentation completed

## Key Features Implemented

### Backend API

- Product CRUD operations
- User authentication (register/login)
- Order management
- JWT token-based security
- MongoDB integration
- Error handling and validation

### Frontend

- Product listing with grid display
- Shopping cart functionality
- Add/remove cart items
- Cart total calculation
- API integration
- Responsive design
- Loading states and error handling

## Available Commands

### Backend

```bash
cd backend
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run compiled code
npm run lint     # Run ESLint
npm test         # Run tests
```

### Frontend

```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Environment Configuration

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

## API Endpoints

### Products

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Orders

- `GET /api/orders` - Get user orders (auth required)
- `GET /api/orders/:id` - Get order details (auth required)
- `POST /api/orders` - Create order (auth required)

## File Structure

### Backend (`backend/src/`)

- `index.ts` - Server entry point
- `models/` - Mongoose schemas
  - `Product.ts`
  - `User.ts`
  - `Order.ts`
- `routes/` - API endpoints
  - `products.ts`
  - `auth.ts`
  - `orders.ts`
- `middleware/` - Express middleware
  - `auth.ts` - JWT authentication

### Frontend (`frontend/src/`)

- `App.tsx` - Main application component
- `main.tsx` - React entry point
- `App.css` - Application styling
- `index.css` - Global styles

## Next Steps

1. Connect to MongoDB (local or Atlas)
2. Start backend: `npm run dev` in `backend/`
3. Start frontend: `npm run dev` in `frontend/`
4. Open `http://localhost:5173` in browser
5. Test API endpoints using the frontend UI
6. Implement additional features as needed

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, CSS3
- **Backend**: Express.js, TypeScript, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Database**: MongoDB

## Notes

- MongoDB connection required for backend
- CORS enabled for frontend-backend communication
- All passwords are automatically hashed with bcryptjs
- JWT tokens expire in 7 days
- Responsive design supports mobile and desktop

## Project Status

✅ **Setup Complete** - Ready for development and testing

For more details, see [README.md](../README.md)
