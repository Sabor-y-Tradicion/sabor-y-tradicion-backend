import { z } from 'zod';

// Validador para el Hero
const heroSchema = z.object({
  title: z.string().max(100, 'El título debe tener máximo 100 caracteres').optional(),
  subtitle: z.string().max(200, 'El subtítulo debe tener máximo 200 caracteres').optional(),
  imageUrl: z.string().optional(),
  ctaText: z.string().max(50, 'El texto del botón debe tener máximo 50 caracteres').optional(),
  ctaLink: z.string().regex(/^\//, 'El enlace debe empezar con /').optional(),
});

// Validador para Feature Item
const featureItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(50, 'El título debe tener máximo 50 caracteres'),
  description: z.string().max(200, 'La descripción debe tener máximo 200 caracteres'),
  imageUrl: z.string().optional(),
});

// Validador para Features
const featuresSchema = z.object({
  enabled: z.boolean().optional(),
  items: z.array(featureItemSchema).max(6, 'No se pueden agregar más de 6 características').optional(),
});

// Validador para Carousel Image
const carouselImageSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  alt: z.string().max(100, 'El texto alternativo debe tener máximo 100 caracteres').optional(),
  order: z.number().int().min(0).optional(),
});

// Validador para Carousel
const carouselSchema = z.object({
  enabled: z.boolean().optional(),
  autoplay: z.boolean().optional(),
  interval: z.number().int().min(2000).max(10000).optional(),
  images: z.array(carouselImageSchema).max(10, 'No se pueden agregar más de 10 imágenes').optional(),
});

// Validador para History
const historySchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().max(100, 'El título debe tener máximo 100 caracteres').optional(),
  content: z.string().max(2000, 'El contenido debe tener máximo 2000 caracteres').optional(),
  imageUrl: z.string().optional(),
});

// Validador para Mission
const missionSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().max(100, 'El título debe tener máximo 100 caracteres').optional(),
  content: z.string().max(2000, 'El contenido debe tener máximo 2000 caracteres').optional(),
  imageUrl: z.string().optional(),
});

// Validador para Value Item
const valueItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(50, 'El título debe tener máximo 50 caracteres'),
  description: z.string().max(200, 'La descripción debe tener máximo 200 caracteres'),
});

// Validador para Values
const valuesSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().max(100, 'El título debe tener máximo 100 caracteres').optional(),
  items: z.array(valueItemSchema).max(8, 'No se pueden agregar más de 8 valores').optional(),
});

// Validador para actualizar Home
export const updateHomeConfigSchema = z.object({
  hero: heroSchema.optional(),
  features: featuresSchema.optional(),
  carousel: carouselSchema.optional(),
});

// Validador para actualizar About
export const updateAboutConfigSchema = z.object({
  history: historySchema.optional(),
  mission: missionSchema.optional(),
  values: valuesSchema.optional(),
});

// Validador para upload de imagen
export const uploadImageSchema = z.object({
  section: z.enum(['home', 'about', 'carousel', 'features', 'hero', 'history', 'mission']).optional(),
});

// Tipos
export type UpdateHomeConfigInput = z.infer<typeof updateHomeConfigSchema>;
export type UpdateAboutConfigInput = z.infer<typeof updateAboutConfigSchema>;
export type UploadImageInput = z.infer<typeof uploadImageSchema>;

