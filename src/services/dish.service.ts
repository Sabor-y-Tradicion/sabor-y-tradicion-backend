import prisma from '../config/database';
import { CreateDishInput, UpdateDishInput } from '../validators/dish.validator';
import { generateSlug } from '../utils/helpers';

export class DishService {
  async getAll(filters?: {
    categoryId?: string;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

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

  async getById(id: string) {
    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!dish) {
      throw new Error('Dish not found');
    }

    return dish;
  }

  async getBySlug(slug: string) {
    const dish = await prisma.dish.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!dish) {
      throw new Error('Dish not found');
    }

    return dish;
  }

  async create(data: CreateDishInput) {
    const slug = generateSlug(data.name);

    // Check if slug already exists
    const existingDish = await prisma.dish.findUnique({
      where: { slug },
    });

    if (existingDish) {
      throw new Error('Dish with this name already exists');
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
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
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        allergens: data.allergens ?? [],
        tags: data.tags ?? [],
        preparationTime: data.preparationTime,
        servings: data.servings,
        order: data.order ?? 0,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: UpdateDishInput) {
    // Check if dish exists
    const dish = await prisma.dish.findUnique({
      where: { id },
    });

    if (!dish) {
      throw new Error(`Dish with id ${id} not found`);
    }

    // Validate category exists if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
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

  async delete(id: string) {
    // Check if dish exists
    const dish = await prisma.dish.findUnique({
      where: { id },
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

