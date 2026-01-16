import prisma from '../config/database';
import { CreateDishInput, UpdateDishInput } from '../validators/dish.validator';
import { generateSlug } from '../utils/helpers';
import subtagService from './subtag.service';

export class DishService {
  async getAll(filters?: {
    categoryId?: string;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
    tenantId?: string;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.tenantId) {
      where.tenantId = filters.tenantId;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    const [dishes, total] = await Promise.all([
      prisma.dish.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      prisma.dish.count({ where }),
    ]);

    return {
      data: dishes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const dish = await prisma.dish.findFirst({
      where,
      include: {
        category: true,
      },
    });

    if (!dish) {
      throw new Error('Dish not found');
    }

    return dish;
  }

  async getBySlug(slug: string, tenantId: string) {
    const dish = await prisma.dish.findUnique({
      where: {
        slug_tenantId: {
          slug,
          tenantId,
        },
      },
      include: {
        category: true,
      },
    });

    if (!dish) {
      throw new Error('Dish not found');
    }

    // Poblar subtags si existen
    let subtags: any[] = [];
    if (dish.subtagIds && dish.subtagIds.length > 0) {
      subtags = await subtagService.findByIds(dish.subtagIds, tenantId);
    }

    return {
      ...dish,
      subtags,
    };
  }

  async create(data: CreateDishInput, tenantId: string) {
    const slug = generateSlug(data.name);

    // Check if slug already exists for this tenant
    const existingDish = await prisma.dish.findUnique({
      where: {
        slug_tenantId: {
          slug,
          tenantId,
        },
      },
    });

    if (existingDish) {
      throw new Error('Dish with this name already exists');
    }

    // Check if category exists and belongs to tenant
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        tenantId,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return await prisma.dish.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        image: data.image,
        slug,
        tenantId,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        allergens: data.allergens ?? [],
        tags: data.tags ?? [],
        subtagIds: data.subtagIds ?? [],
        preparationTime: data.preparationTime,
        servings: data.servings,
        order: data.order ?? 0,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: UpdateDishInput, tenantId?: string) {
    // Check if dish exists and belongs to tenant
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const dish = await prisma.dish.findFirst({
      where,
    });

    if (!dish) {
      throw new Error(`Dish with id ${id} not found`);
    }

    // Validate category exists if provided and belongs to tenant
    if (data.categoryId) {
      const categoryWhere: any = { id: data.categoryId };
      if (tenantId) {
        categoryWhere.tenantId = tenantId;
      }

      const category = await prisma.category.findFirst({
        where: categoryWhere,
      });

      if (!category) {
        throw new Error(`Category with id ${data.categoryId} not found`);
      }
    }

    // Generate new slug if name changed
    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    return await prisma.dish.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string, tenantId?: string) {
    // Check if dish exists and belongs to tenant
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const dish = await prisma.dish.findFirst({
      where,
    });

    if (!dish) {
      throw new Error('Dish not found');
    }

    await prisma.dish.delete({
      where: { id },
    });

    return { message: 'Dish deleted successfully' };
  }

  async reorder(dishIds: string[]) {
    // Update order for each dish
    const updates = dishIds.map((id, index) =>
      prisma.dish.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    return { message: 'Dishes reordered successfully' };
  }
}

export default new DishService();

