import { z } from 'zod';

// Schema para crear un subtag
export const createSubtagSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim()
    .refine((val) => val.length > 0, {
      message: 'El nombre no puede contener solo espacios',
    }),
});

// Schema para actualizar un subtag
export const updateSubtagSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim()
    .refine((val) => val.length > 0, {
      message: 'El nombre no puede contener solo espacios',
    })
    .optional(),
});

export type CreateSubtagInput = z.infer<typeof createSubtagSchema>;
export type UpdateSubtagInput = z.infer<typeof updateSubtagSchema>;

