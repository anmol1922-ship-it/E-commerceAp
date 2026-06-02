const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    const admin = await prisma.user.upsert({
      where: { email: "admin@bisleri.com" },
      update: {},
      create: {
        name: "Bisleri Admin",
        email: "admin@bisleri.com",
        phone: "9876543210",
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("");
    console.log("📧 Email: admin@bisleri.com");
    console.log("🔐 Password: Admin@123");
    console.log("");
    console.log("Login at: http://localhost:5173/login");
    console.log("Admin Dashboard: http://localhost:5173/admin/dashboard");
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
