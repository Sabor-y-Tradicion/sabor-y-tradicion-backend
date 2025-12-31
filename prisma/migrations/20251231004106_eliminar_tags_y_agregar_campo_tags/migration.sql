/*
  Warnings:

  - You are about to drop the column `isGlutenFree` on the `dishes` table. All the data in the column will be lost.
  - You are about to drop the column `isSpicy` on the `dishes` table. All the data in the column will be lost.
  - You are about to drop the column `isVegan` on the `dishes` table. All the data in the column will be lost.
  - You are about to drop the column `isVegetarian` on the `dishes` table. All the data in the column will be lost.
  - You are about to drop the `_DishToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DishToTag" DROP CONSTRAINT "_DishToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_DishToTag" DROP CONSTRAINT "_DishToTag_B_fkey";

-- AlterTable
ALTER TABLE "dishes" DROP COLUMN "isGlutenFree",
DROP COLUMN "isSpicy",
DROP COLUMN "isVegan",
DROP COLUMN "isVegetarian",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "allergens" SET DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "_DishToTag";

-- DropTable
DROP TABLE "tags";
