import { z } from 'zod';

// Schema para crear tenant - EXACTAMENTE como lo envía el frontend
export const createTenantSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  subdomain: z.string().min(3, 'El subdomain debe tener al menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'El subdomain solo puede contener letras minúsculas, números y guiones'),
  adminName: z.string().min(3, 'El nombre del admin debe tener al menos 3 caracteres'),
  adminEmail: z.string().email('Email del admin inválido'),
  adminPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    customDomain: z.string().optional(),
    plan: z.enum(['free', 'premium', 'enterprise']).optional(),
  }),
});

export const updateTenantSettingsSchema = z.object({
  body: z.object({}).passthrough(), // Acepta cualquier objeto como settings
});

export const validate = (schema: z.ZodTypeAny) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error,
        });
      }
      next(error);
    }
  };
};

