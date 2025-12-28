import { z } from 'zod';

export const createDishSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  categoryId: z.string().cuid('ID de categoría inválido'),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
  isActive: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  order: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateDishSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),
  price: z.number().positive('El precio debe ser mayor a 0').optional(),
  categoryId: z.string().cuid('ID de categoría inválido').optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
  isActive: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  order: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateDishInput = z.infer<typeof createDishSchema>;
export type UpdateDishInput = z.infer<typeof updateDishSchema>;

