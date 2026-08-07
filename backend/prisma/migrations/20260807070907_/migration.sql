-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'app_settings',
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "deliveryCharge" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "freeDeliveryThreshold" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "minimumOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "servicablePincodes" TEXT[] DEFAULT ARRAY['401201', '401202', '401203', '401204', '401205', '401207', '401208', '401209', '401210', '401301', '401302', '401303', '401304', '401305']::TEXT[],
    "deliverySlots" TEXT[] DEFAULT ARRAY['9 AM – 12 PM', '12 PM – 3 PM', '3 PM – 6 PM', '6 PM – 9 PM']::TEXT[],
    "businessName" TEXT NOT NULL DEFAULT 'Bisleri Vasai',
    "supportPhone" TEXT NOT NULL DEFAULT '',
    "supportEmail" TEXT NOT NULL DEFAULT '',
    "businessHoursStart" TEXT NOT NULL DEFAULT '09:00',
    "businessHoursEnd" TEXT NOT NULL DEFAULT '21:00',
    "privacyPolicyUrl" TEXT NOT NULL DEFAULT '',
    "termsUrl" TEXT NOT NULL DEFAULT '',
    "aboutText" TEXT NOT NULL DEFAULT '',
    "appVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");
