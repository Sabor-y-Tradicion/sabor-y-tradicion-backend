import { z } from 'zod';

// Función para validar el tamaño de una imagen base64
const validateImageSize = (base64String: string | null | undefined): boolean => {
  if (!base64String) return true; // Si no hay imagen o es null, es válido

  // Calcular el tamaño aproximado en bytes
  // Una cadena base64 representa ~75% del tamaño original
  const sizeInBytes = (base64String.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  // Máximo 10MB
  return sizeInMB <= 10;
};

export const createDishSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  categoryId: z.string().cuid('ID de categoría inválido'),
  image: z.string().nullable().optional().refine(
    validateImageSize,
    { message: 'La imagen es demasiado grande. El tamaño máximo es 10MB. Por favor, comprime la imagen antes de subirla.' }
  ),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  allergens: z.array(z.string()).optional().default([]),
  order: z.number().int().min(0).optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  subtagIds: z.array(z.string()).optional().default([]),
  preparationTime: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'El tiempo debe ser al menos 1 minuto')
    .max(180, 'El tiempo no puede exceder 180 minutos')
    .optional(),
  servings: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Debe servir al menos 1 porción')
    .max(20, 'No puede exceder 20 porciones')
    .optional(),
});

export const updateDishSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),
  price: z.number().positive('El precio debe ser mayor a 0').optional(),
  categoryId: z.string().cuid('ID de categoría inválido').optional(),
  image: z.string().nullable().optional().refine(
    validateImageSize,
    { message: 'La imagen es demasiado grande. El tamaño máximo es 10MB. Por favor, comprime la imagen antes de subirla.' }
  ),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  order: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
  subtagIds: z.array(z.string()).optional(),
  preparationTime: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'El tiempo debe ser al menos 1 minuto')
    .max(180, 'El tiempo no puede exceder 180 minutos')
    .optional(),
  servings: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Debe servir al menos 1 porción')
    .max(20, 'No puede exceder 20 porciones')
    .optional(),
});

export type CreateDishInput = z.infer<typeof createDishSchema>;
export type UpdateDishInput = z.infer<typeof updateDishSchema>;

