@echo off
REM Quick Setup Script for PostgreSQL + Prisma Backend (Windows)

echo.
echo ========================================
echo 🚀 E-Commerce Backend Setup
echo MongoDB → PostgreSQL + Prisma Migration
echo ========================================
echo.

REM Step 1: Install dependencies
echo [1/5] Installing dependencies...
cd backend
call npm install
if errorlevel 1 goto error
echo ✅ Dependencies installed
echo.

REM Step 2: Generate Prisma client
echo [2/5] Generating Prisma client...
call npx prisma generate
if errorlevel 1 goto error
echo ✅ Prisma client generated
echo.

REM Step 3: Start PostgreSQL (Docker)
echo [3/5] Starting PostgreSQL (Docker)...
echo.
echo Ensure Docker Desktop is running, then run:
echo.
echo   docker run -d -p 5432:5432 ^
echo     -e POSTGRES_PASSWORD=postgres ^
echo     -e POSTGRES_DB=bisleri ^
echo     postgres:latest
echo.
echo ⏸️  Press any key after PostgreSQL is running...
pause

echo ✅ PostgreSQL started
echo.

REM Step 4: Run migrations
echo [4/5] Creating database tables...
call npx prisma migrate dev --name init
if errorlevel 1 goto error
echo ✅ Database tables created
echo.

REM Step 5: Seed data
echo [5/5] Seeding initial data...
call npm run seed
if errorlevel 1 goto error
echo ✅ Database seeded
echo.

REM Success
echo ========================================
echo 🎉 Setup Complete!
echo ========================================
echo.
echo To start the backend:
echo   cd backend
echo   npm run dev
echo.
echo Test credentials:
echo   Admin:    admin@bisleri-vasai.com / admin123
echo   Customer: customer@bisleri-vasai.com / customer123
echo.
echo To view database:
echo   npx prisma studio
echo.
echo Backend URL: http://localhost:3000
echo Frontend URL: http://localhost:5173
echo.
pause
exit /b 0

:error
echo.
echo ❌ Setup failed! Check the error above.
pause
exit /b 1
