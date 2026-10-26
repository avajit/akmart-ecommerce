-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountType') THEN
        CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
        CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FulfillmentStatus') THEN
        CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" DECIMAL(10,2) NOT NULL,
    "maxDiscount" DECIMAL(10,2),
    "minOrderAmount" DECIMAL(10,2),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "couponId" TEXT,
    "couponCode" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "shippingAddressId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- AlterTable (for instances where Order already existed without coupon fields)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sellerListingId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" DECIMAL(10,2) NOT NULL,
    "status" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId");
CREATE INDEX IF NOT EXISTS "Address_createdAt_idx" ON "Address"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX IF NOT EXISTS "Coupon_code_idx" ON "Coupon"("code");
CREATE INDEX IF NOT EXISTS "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_couponId_idx" ON "Order"("couponId");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_sellerId_idx" ON "OrderItem"("sellerId");
CREATE INDEX IF NOT EXISTS "OrderItem_sellerListingId_idx" ON "OrderItem"("sellerListingId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Address_userId_fkey') THEN
        ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Order_userId_fkey') THEN
        ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Order_couponId_fkey') THEN
        ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Order_shippingAddressId_fkey') THEN
        ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_orderId_fkey') THEN
        ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_sellerListingId_fkey') THEN
        ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sellerListingId_fkey" FOREIGN KEY ("sellerListingId") REFERENCES "SellerListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
