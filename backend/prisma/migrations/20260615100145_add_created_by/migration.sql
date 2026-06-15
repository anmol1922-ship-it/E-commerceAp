-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reorderLevel" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "supplierId" TEXT;

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "referenceNumber" TEXT,
    "supplierId" TEXT,
    "remarks" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JarReturn" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "jarsIssued" INTEGER NOT NULL DEFAULT 0,
    "jarsReturned" INTEGER NOT NULL DEFAULT 0,
    "pendingJars" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outstandingDeposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "returnStatus" TEXT NOT NULL DEFAULT 'pending',
    "lastReturnDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JarReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryTransaction_productId_idx" ON "InventoryTransaction"("productId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_type_idx" ON "InventoryTransaction"("type");

-- CreateIndex
CREATE INDEX "InventoryTransaction_createdAt_idx" ON "InventoryTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryTransaction_productId_createdAt_idx" ON "InventoryTransaction"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "JarReturn_userId_idx" ON "JarReturn"("userId");

-- CreateIndex
CREATE INDEX "JarReturn_customerPhone_idx" ON "JarReturn"("customerPhone");

-- CreateIndex
CREATE INDEX "JarReturn_customerName_idx" ON "JarReturn"("customerName");

-- CreateIndex
CREATE INDEX "JarReturn_createdAt_idx" ON "JarReturn"("createdAt");

-- CreateIndex
CREATE INDEX "JarReturn_returnStatus_idx" ON "JarReturn"("returnStatus");

-- CreateIndex
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");

-- CreateIndex
CREATE INDEX "Product_reorderLevel_idx" ON "Product"("reorderLevel");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JarReturn" ADD CONSTRAINT "JarReturn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
