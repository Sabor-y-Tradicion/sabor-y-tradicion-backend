import { z } from 'zod';

// Validador para items del pedido - Soporta ambos formatos
const orderItemSchema = z.object({
  // Formato 1: dish como objeto
  dish: z.object({
    id: z.string().min(1, 'El ID del plato es requerido'),
    name: z.string().min(1, 'El nombre del plato es requerido'),
    price: z.number().positive('El precio debe ser positivo'),
    image: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  // Formato 2: campos directos (como los envía el frontend)
  dishId: z.string().optional(),
  name: z.string().optional(),
  unitPrice: z.number().optional(),
  quantity: z.number().int().positive('La cantidad debe ser un número positivo'),
  subtotal: z.number().positive('El subtotal debe ser positivo'),
}).refine(
  (data) => {
    // Debe tener dish O (dishId + name)
    return data.dish || (data.dishId && data.name);
  },
  {
    message: 'Cada item debe tener información del plato (dish o dishId+name)',
  }
);

// Validador para información del cliente
const customerSchema = z.object({
  name: z.string().min(1, 'El nombre del cliente es requerido'),
  phone: z.string()
    .regex(/^\+51\d{9}$/, 'El teléfono debe tener el formato +51XXXXXXXXX (código de país de Perú + 9 dígitos)')
    .min(12, 'El teléfono debe incluir +51 y 9 dígitos')
    .max(12, 'El teléfono debe incluir +51 y 9 dígitos'),
  documentType: z.enum(['boleta', 'factura']).default('boleta'),
  documentNumber: z.string().optional(),
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
});

// Validador para información de entrega
const deliverySchema = z.object({
  type: z.enum(['delivery', 'pickup'], {
    message: 'El tipo de entrega debe ser "delivery" o "pickup"',
  }),
  address: z.string().optional(),
}).refine(
  (data) => {
    // Si es delivery, la dirección es obligatoria
    if (data.type === 'delivery') {
      return data.address && data.address.length > 0;
    }
    return true;
  },
  {
    message: 'La dirección es requerida para pedidos con entrega a domicilio',
  }
);

// Validador para información de pago
const paymentSchema = z.object({
  method: z.enum(['efectivo', 'tarjeta', 'billetera'], {
    message: 'El método de pago debe ser "efectivo", "tarjeta" o "billetera"',
  }),
});

// Validador para crear pedido
export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'El pedido debe tener al menos un item'),
  customer: customerSchema,
  delivery: deliverySchema,
  payment: paymentSchema,
  subtotal: z.number().nonnegative('El subtotal no puede ser negativo'),
  total: z.number().positive('El total debe ser mayor a 0'),
  notes: z.string().optional(),
});

// Validador para actualizar estado - Acepta mayúsculas y minúsculas
export const updateOrderStatusSchema = z.object({
  status: z.string().min(1, 'El estado es requerido'),
}).transform((data) => ({
  status: data.status.toUpperCase()
})).refine(
  (data) => ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].includes(data.status),
  {
    message: 'Estado inválido. Valores permitidos: PENDING, PREPARING, READY, DELIVERED, CANCELLED',
  }
);

// Validador para filtros de búsqueda
export const orderFiltersSchema = z.object({
  status: z.string().toUpperCase().pipe(
    z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'])
  ).optional(),
  customerPhone: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

// Tipos exportados
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;

