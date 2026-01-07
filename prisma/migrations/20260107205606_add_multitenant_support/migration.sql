-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add nullable tenantId to users first
ALTER TABLE "users" DROP CONSTRAINT "users_email_key";
ALTER TABLE "users" ADD COLUMN "tenantId" TEXT;

-- AlterTable: Add nullable tenantId to categories first
ALTER TABLE "categories" DROP CONSTRAINT "categories_name_key";
ALTER TABLE "categories" DROP CONSTRAINT "categories_slug_key";
ALTER TABLE "categories" ADD COLUMN "tenantId" TEXT;

-- AlterTable: Add nullable tenantId to dishes first
ALTER TABLE "dishes" DROP CONSTRAINT "dishes_slug_key";
ALTER TABLE "dishes" ADD COLUMN "tenantId" TEXT;

-- AlterTable: Add nullable tenantId to settings first
ALTER TABLE "settings" DROP CONSTRAINT "settings_key_key";
ALTER TABLE "settings" ADD COLUMN "tenantId" TEXT;

-- AlterTable: Add nullable tenantId to page_content first
ALTER TABLE "page_content" DROP CONSTRAINT "page_content_page_section_key";
ALTER TABLE "page_content" ADD COLUMN "tenantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_tenantId_key" ON "users"("email", "tenantId");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_tenantId_key" ON "categories"("slug", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_tenantId_key" ON "categories"("name", "tenantId");

-- CreateIndex
CREATE INDEX "categories_tenantId_idx" ON "categories"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "dishes_slug_tenantId_key" ON "dishes"("slug", "tenantId");

-- CreateIndex
CREATE INDEX "dishes_tenantId_idx" ON "dishes"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_tenantId_key" ON "settings"("key", "tenantId");

-- CreateIndex
CREATE INDEX "settings_tenantId_idx" ON "settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "page_content_page_section_tenantId_key" ON "page_content"("page", "section", "tenantId");

-- CreateIndex
CREATE INDEX "page_content_tenantId_idx" ON "page_content"("tenantId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_content" ADD CONSTRAINT "page_content_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
