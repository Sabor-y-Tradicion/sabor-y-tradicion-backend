-- AlterTable
ALTER TABLE "dishes" ADD COLUMN     "subtagIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "subtags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subtags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subtags_tenantId_idx" ON "subtags"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "subtags_name_tenantId_key" ON "subtags"("name", "tenantId");

-- AddForeignKey
ALTER TABLE "subtags" ADD CONSTRAINT "subtags_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
