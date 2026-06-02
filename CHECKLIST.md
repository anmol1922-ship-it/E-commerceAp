# Backend Migration Checklist - PostgreSQL + Prisma

## ✅ Completed

### Code Migration

- [x] `package.json` — Mongoose removed, Prisma added
- [x] `prisma/schema.prisma` — All 7 models defined with relationships
- [x] `.env` — PostgreSQL connection URL configured
- [x] `src/config/db.ts` — PrismaClient initialization
- [x] `src/models/User.ts` — Prisma types + password utilities
- [x] `src/models/Product.ts` — Prisma type export
- [x] `src/models/Order.ts` — Prisma Order + OrderItem types
- [x] `src/models/Cart.ts` — Prisma Cart + CartItem types
- [x] `src/middleware/auth.ts` — JWT middleware with Prisma queries
- [x] `src/controllers/authController.ts` — All 5 endpoints converted
- [x] `src/controllers/productController.ts` — All 6 endpoints converted
- [x] `src/controllers/cartController.ts` — All 5 endpoints converted
- [x] `src/controllers/orderController.ts` — All 7 endpoints with transactions
- [x] `src/scripts/seed.ts` — Prisma seeding script
- [x] TypeScript errors fixed

### Documentation

- [x] `SETUP_PRISMA.md` — Detailed setup guide
- [x] `MIGRATION_SUMMARY.md` — Executive summary
- [x] `SETUP.sh` — Linux/Mac setup script
- [x] `SETUP.bat` — Windows setup script
- [x] This checklist

## 🔄 TODO - Before First Run

### 1. Install Dependencies

```bash
cd backend
npm install
```

**Status:** ⏳ Not yet run
**Time:** ~2-3 minutes

### 2. Setup PostgreSQL

Choose one method:

#### Docker (Recommended)

```bash
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bisleri \
  postgres:latest
```

**Status:** ⏳ Not yet run
**Time:** ~30 seconds

#### Or: Local PostgreSQL

- Download: https://www.postgresql.org/download/windows/
- Install with default settings
- Ensure running on localhost:5432

### 3. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

**Status:** ⏳ Not yet run
**Time:** ~30 seconds

### 4. Create Database Schema

```bash
npx prisma migrate dev --name init
```

**Status:** ⏳ Not yet run
**Time:** ~10 seconds
**Result:** 7 tables created in PostgreSQL

### 5. Seed Initial Data

```bash
npm run seed
```

**Status:** ⏳ Not yet run
**Time:** ~5 seconds
**Result:** 8 products + admin user + test customer

### 6. Start Backend

```bash
npm run dev
```

**Status:** ⏳ Not yet run
**Expected Output:**

```
🚀 PostgreSQL connected via Prisma
Server running on port 3000
```

## ✅ Verify After Setup

### Database Connection

```bash
# Should open Prisma Studio (visual DB browser)
npx prisma studio
```

- [ ] Tables visible: users, products, orders, carts, etc.
- [ ] Data visible: 8 products, admin user, test customer

### Backend API

```bash
# In browser or curl
curl http://localhost:3000/api/products
```

- [ ] Gets 200 response
- [ ] Returns array of 8 products

### Login Test

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bisleri-vasai.com","password":"admin123"}'
```

- [ ] Gets 200 response with JWT token

### Cart Test

```bash
# After getting token above:
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer {TOKEN}"
```

- [ ] Gets 200 response with cart object

## 🚀 Next Steps - Full Stack

### Start Frontend (new terminal)

```bash
cd frontend
npm run dev
```

**Expected:** http://localhost:5173 loads

### Open in Browser

- [ ] Frontend loads at http://localhost:5173
- [ ] Can see products list
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can add items to cart
- [ ] Can proceed to checkout

### Test Full Order Flow

- [ ] Login as test customer (customer@bisleri-vasai.com / customer123)
- [ ] Add products to cart
- [ ] Checkout (enter delivery address)
- [ ] Try COD payment (should succeed)
- [ ] Verify order in `/api/orders`

## 📊 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution:**

```bash
npm install
npx prisma generate
```

### Issue: "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Solution:**

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify connection: `psql -U postgres -d bisleri -h localhost`

### Issue: "PrismaClientInitializationError: Prisma Client failed to initialize"

**Solution:**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Issue: "relation \"User\" does not exist"

**Solution:**

```bash
npx prisma migrate reset  # WARNING: Deletes all data!
npx prisma migrate dev --name init
npm run seed
```

### Issue: Port 5432 already in use

**Solution:**

```bash
# Find and kill existing PostgreSQL
lsof -i :5432
kill -9 <PID>

# Or use different port in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/bisleri"
```

## 📝 Test Credentials (After Seed)

| Role     | Email                      | Password    |
| -------- | -------------------------- | ----------- |
| Admin    | admin@bisleri-vasai.com    | admin123    |
| Customer | customer@bisleri-vasai.com | customer123 |

## 📦 Dependency Versions

After `npm install`:

- @prisma/client: ^5.8.0
- prisma: ^5.8.0
- express: ^4.21.0
- typescript: ^5.6.2
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.2
- razorpay: ^2.9.4
- express-validator: ^7.2.0
- winston: ^3.14.2

## ⏱️ Expected Timeline

| Step             | Time    | Cumulative     |
| ---------------- | ------- | -------------- |
| npm install      | 2-3 min | 2-3 min        |
| start PostgreSQL | 30 sec  | 3-3.5 min      |
| prisma generate  | 30 sec  | 4 min          |
| prisma migrate   | 10 sec  | 4-4.1 min      |
| npm run seed     | 5 sec   | 4-4.2 min      |
| **Total**        |         | **~4 minutes** |

## ✅ Final Checklist Before "Production Use"

- [ ] PostgreSQL running and accessible
- [ ] `npm install` completed with no errors
- [ ] `npx prisma migrate dev --name init` created all tables
- [ ] `npm run seed` populated data
- [ ] `npm run dev` starts without errors
- [ ] `curl http://localhost:3000/api/products` returns products
- [ ] Login endpoint returns JWT token
- [ ] Cart endpoint works with token
- [ ] Prisma Studio shows all data
- [ ] Frontend loads and connects to backend
- [ ] Can complete order flow (COD)
- [ ] Admin users can view dashboard

## 📚 Documentation Links

- **Setup**: [SETUP_PRISMA.md](./backend/SETUP_PRISMA.md)
- **Summary**: [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)
- **Prisma Docs**: https://www.prisma.io/docs/
- **Express Docs**: https://expressjs.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## 🎯 Current Status

**Overall:** ✅ **Code migration complete, ready for setup**

**Next Action:** Run SETUP.bat (Windows) or SETUP.sh (Linux/Mac)

---

**Last Updated:** Today  
**Migration Type:** MongoDB + Mongoose → PostgreSQL + Prisma  
**Backward Compatible:** Yes (frontend unchanged)
