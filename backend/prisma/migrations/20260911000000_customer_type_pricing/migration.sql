-- CreateTable
CREATE TABLE "CustomerType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerType_pkey" PRIMARY KEY ("id")
);

-- Seed the stable customer types before assigning existing records.
INSERT INTO "CustomerType" ("id", "code", "name", "isActive", "createdAt", "updatedAt")
VALUES
    ('customer-type-end-user', 'END_USER', 'End User', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('customer-type-distributor', 'DISTRIBUTOR', 'Distributor', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerType_code_key" ON "CustomerType"("code");

-- Add customer type to users. Administrators intentionally remain nullable.
ALTER TABLE "User" ADD COLUMN "customerTypeId" TEXT;

UPDATE "User"
SET "customerTypeId" = 'customer-type-end-user'
WHERE LOWER("role") <> 'admin';

-- CreateTable
CREATE TABLE "ProductPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "customerTypeId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- Migrate the existing catalog price to the end-user price.
INSERT INTO "ProductPrice" ("id", "productId", "customerTypeId", "price", "createdAt", "updatedAt")
SELECT
    md5('end-user:' || p."id"),
    p."id",
    'customer-type-end-user',
    p."price",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Product" p;

-- Use explicit distributor business prices where supplied. For products without
-- an existing distributor price, retain the old catalog price until an admin
-- configures a separate distributor price.
INSERT INTO "ProductPrice" ("id", "productId", "customerTypeId", "price", "createdAt", "updatedAt")
SELECT
    md5('distributor:' || p."id"),
    p."id",
    'customer-type-distributor',
    CASE p."slug"
        WHEN 'bisleri-20l-jar' THEN 70
        WHEN 'bisleri-10l-jar' THEN 90
        WHEN 'bisleri-5l-jar' THEN 55
        ELSE p."price"
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Product" p;

-- Snapshot customer type on historical orders before making the field required.
ALTER TABLE "Order" ADD COLUMN "customerTypeId" TEXT;

UPDATE "Order" o
SET "customerTypeId" = COALESCE(u."customerTypeId", 'customer-type-end-user')
FROM "User" u
WHERE o."userId" = u."id";

UPDATE "Order"
SET "customerTypeId" = 'customer-type-end-user'
WHERE "customerTypeId" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "customerTypeId" SET NOT NULL;

-- Preserve existing order prices as immutable unit-price snapshots and add totals.
ALTER TABLE "OrderItem" RENAME COLUMN "price" TO "unitPrice";
ALTER TABLE "OrderItem" ADD COLUMN "totalPrice" DOUBLE PRECISION;

UPDATE "OrderItem"
SET "totalPrice" = ROUND(("unitPrice" * "quantity")::numeric, 2);

ALTER TABLE "OrderItem" ALTER COLUMN "totalPrice" SET NOT NULL;

-- CreateIndex
CREATE INDEX "User_customerTypeId_idx" ON "User"("customerTypeId");
CREATE UNIQUE INDEX "ProductPrice_productId_customerTypeId_key" ON "ProductPrice"("productId", "customerTypeId");
CREATE INDEX "ProductPrice_customerTypeId_idx" ON "ProductPrice"("customerTypeId");
CREATE INDEX "ProductPrice_productId_idx" ON "ProductPrice"("productId");
CREATE INDEX "Order_customerTypeId_idx" ON "Order"("customerTypeId");

-- Product.price is no longer a source of truth after its values are migrated.
DROP INDEX IF EXISTS "Product_category_price_idx";
CREATE INDEX "Product_category_idx" ON "Product"("category");
ALTER TABLE "Product" DROP COLUMN "price";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_customerTypeId_fkey" FOREIGN KEY ("customerTypeId") REFERENCES "CustomerType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_customerTypeId_fkey" FOREIGN KEY ("customerTypeId") REFERENCES "CustomerType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerTypeId_fkey" FOREIGN KEY ("customerTypeId") REFERENCES "CustomerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
