import prisma from '../config/database';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';
import { generateSlug } from '../utils/helpers';

export class CategoryService {
  async getAll(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};

    return await prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });
  }

  async getById(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const category = await prisma.category.findUnique({
      where,
      include: {
        dishes: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async getBySlug(slug: string, tenantId: string) {
    const category = await prisma.category.findUnique({
      where: {
        slug_tenantId: {
          slug,
          tenantId,
        },
      },
      include: {
        dishes: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async create(data: CreateCategoryInput, tenantId: string) {
    const slug = generateSlug(data.name);

    // Check if slug already exists for this tenant
    const existingCategory = await prisma.category.findUnique({
      where: {
        slug_tenantId: {
          slug,
          tenantId,
        },
      },
    });

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    return await prisma.category.create({
      data: {
        ...data,
        slug,
        tenantId,
      },
    });
  }

  async update(id: string, data: UpdateCategoryInput, tenantId?: string) {
    // Check if category exists
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const category = await prisma.category.findFirst({
      where,
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Generate new slug if name changed
    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    return await prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, tenantId?: string) {
    // Check if category exists
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const category = await prisma.category.findFirst({
      where,
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has dishes
    if (category._count.dishes > 0) {
      throw new Error('Cannot delete category with associated dishes');
    }

    await prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  async reorder(categoryIds: string[]) {
    // Update order for each category
    const updates = categoryIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    return { message: 'Categories reordered successfully' };
  }
}

export default new CategoryService();

