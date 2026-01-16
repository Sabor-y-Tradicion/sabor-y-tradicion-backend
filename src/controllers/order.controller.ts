import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import {
  createOrderSchema,
  orderFiltersSchema,
} from '../validators/order.validator';
import { successResponse, errorResponse } from '../utils/response';
import { PrismaClient } from '@prisma/client';

const orderService = new OrderService();
const prisma = new PrismaClient();

/**
 * @route   POST /api/orders/public
 * @desc    Crear nuevo pedido (PÚBLICO - Sin autenticación)
 * @access  Public
 */
export const createPublic = async (req: Request, res: Response) => {
  try {
    // Obtener tenant desde el header X-Tenant-Domain
    const tenantDomain = req.headers['x-tenant-domain'] as string;

    console.log('📦 [PUBLIC ORDER] Domain recibido:', tenantDomain);
    console.log('📦 [PUBLIC ORDER] Body:', JSON.stringify(req.body, null, 2));

    if (!tenantDomain) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el header X-Tenant-Domain'
      });
    }

    // Buscar tenant por dominio o slug
    const slug = tenantDomain.split('.')[0];
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { domain: tenantDomain },
          { customDomain: tenantDomain },
          { slug: slug }
        ],
        status: 'active'
      }
    });

    if (!tenant) {
      console.log('❌ [PUBLIC ORDER] Tenant no encontrado:', tenantDomain);
      return res.status(404).json({
        success: false,
        error: 'Restaurante no encontrado'
      });
    }

    console.log('✅ [PUBLIC ORDER] Tenant encontrado:', tenant.name);

    // Validar datos
    const validatedData = createOrderSchema.parse(req.body);

    // Crear pedido
    const order = await orderService.create(validatedData, tenant.id);

    console.log('✅ [PUBLIC ORDER] Pedido creado:', order.orderNumber);

    return res.status(201).json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error('❌ [PUBLIC ORDER] Error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Datos del pedido inválidos',
        details: error.errors
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message || 'Error al crear el pedido'
    });
  }
};

/**
 * @route   POST /api/orders
 * @desc    Crear nuevo pedido (requiere tenant en request o header)
 * @access  Public
 */
export const create = async (req: Request, res: Response) => {
  try {
    // Intentar obtener tenant de múltiples fuentes
    let tenantId = req.tenant?.id;

    // Si no hay tenant en req, intentar desde header
    if (!tenantId) {
      const tenantDomain = req.headers['x-tenant-domain'] as string;
      if (tenantDomain) {
        const slug = tenantDomain.split('.')[0];
        const tenant = await prisma.tenant.findFirst({
          where: {
            OR: [
              { domain: tenantDomain },
              { customDomain: tenantDomain },
              { slug: slug }
            ],
            status: 'active'
          }
        });
        if (tenant) {
          tenantId = tenant.id;
        }
      }
    }

    if (!tenantId) {
      return res.status(400).json(errorResponse('Se requiere X-Tenant-Domain header'));
    }

    // Validar datos
    const validatedData = createOrderSchema.parse(req.body);

    // Crear pedido
    const order = await orderService.create(validatedData, tenantId);

    return res.status(201).json(
      successResponse(order, 'Pedido creado exitosamente')
    );
  } catch (error: any) {
    console.error('Error al crear pedido:', error);
    return res.status(400).json(
      errorResponse(error.message || 'Error al crear el pedido')
    );
  }
};

// Helper para obtener tenantId desde request o usuario autenticado
const getTenantId = async (req: any): Promise<string | null> => {
  // PRIORIDAD 1: Header X-Tenant-Domain (SIEMPRE primero)
  const tenantDomain = req.headers['x-tenant-domain'] as string;
  if (tenantDomain) {
    const slug = tenantDomain.split('.')[0];
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { domain: tenantDomain },
          { customDomain: tenantDomain },
          { slug: slug }
        ],
        status: 'active'
      }
    });
    if (tenant) return tenant.id;
  }

  // PRIORIDAD 2: req.tenant (middleware)
  if (req.tenant?.id) return req.tenant.id;

  // PRIORIDAD 3: Usuario autenticado (fallback)
  if (req.user?.tenantId) return req.user.tenantId;

  return null;
};

/**
 * @route   GET /api/orders
 * @desc    Obtener todos los pedidos con filtros
 * @access  Private
 */
export const getAll = async (req: Request, res: Response) => {
  try {
    const tenantId = await getTenantId(req);

    if (!tenantId) {
      return res.status(400).json(errorResponse('Tenant no identificado'));
    }

    // Validación de seguridad: verificar que el usuario pertenece al tenant
    const reqWithUser = req as any;
    if (reqWithUser.user && reqWithUser.user.tenantId) {
      if (reqWithUser.user.tenantId !== tenantId) {
        return res.status(403).json(errorResponse('No tienes permisos para acceder a este tenant'));
      }
    }

    // Validar query params
    const filters = orderFiltersSchema.parse(req.query);

    // Normalizar status a mayúsculas si existe
    if (filters.status) {
      filters.status = filters.status.toUpperCase() as any;
    }

    // Obtener pedidos
    const result = await orderService.findAll({ ...filters, tenantId });

    return res.json(successResponse(result.data, undefined, result.pagination));
  } catch (error: any) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json(
      errorResponse('Error al obtener los pedidos')
    );
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener un pedido por ID
 * @access  Private
 */
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = await getTenantId(req);

    const order = await orderService.findById(id, tenantId || undefined);

    if (!order) {
      return res.status(404).json(
        errorResponse('Pedido no encontrado')
      );
    }

    return res.json(successResponse(order));
  } catch (error: any) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json(
      errorResponse('Error al obtener el pedido')
    );
  }
};

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Actualizar estado del pedido
 * @access  Private
 */
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = await getTenantId(req);

    // Obtener status desde body o query
    let statusValue = req.body?.status || req.query?.status;

    if (!statusValue) {
      return res.status(400).json({
        success: false,
        error: 'El estado es requerido',
        received: { body: req.body, query: req.query }
      });
    }

    // Normalizar a mayúsculas
    const normalizedStatus = String(statusValue).toUpperCase();

    // Validar que sea un estado válido (solo 2 estados)
    const validStatuses = ['PREPARING', 'DELIVERED'];
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido: ${statusValue}. Valores permitidos: ${validStatuses.join(', ')}`,
        received: statusValue
      });
    }

    // Actualizar estado
    const order = await orderService.updateStatus(id, { status: normalizedStatus }, tenantId || undefined);

    // Log especial cuando se marca como DELIVERED
    if (normalizedStatus === 'DELIVERED') {
      const customer = order.customer as any;
      const delivery = order.delivery as any;
      console.log('📱 [DELIVERED] Pedido marcado como entregado:', {
        orderNumber: order.orderNumber,
        customerName: customer?.name,
        customerPhone: customer?.phone,
        deliveryType: delivery?.type,
        tenantId: order.tenantId
      });
    }

    return res.json(
      successResponse(order, 'Estado actualizado exitosamente')
    );
  } catch (error: any) {
    console.error('❌ [UPDATE STATUS] Error:', error);

    if (error.message === 'Pedido no encontrado') {
      return res.status(404).json(errorResponse(error.message));
    }

    return res.status(400).json(
      errorResponse(error.message || 'Error al actualizar el estado')
    );
  }
};

/**
 * @route   DELETE /api/orders/:id
 * @desc    Eliminar un pedido
 * @access  Private
 */
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = await getTenantId(req);

    await orderService.delete(id, tenantId || undefined);

    return res.json(
      successResponse(null, 'Pedido eliminado exitosamente')
    );
  } catch (error: any) {
    console.error('Error al eliminar pedido:', error);

    if (error.message === 'Pedido no encontrado') {
      return res.status(404).json(errorResponse(error.message));
    }

    return res.status(400).json(
      errorResponse(error.message || 'Error al eliminar el pedido')
    );
  }
};

/**
 * @route   GET /api/orders/stats
 * @desc    Obtener estadísticas de pedidos
 * @access  Private
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const tenantId = await getTenantId(req);
    const stats = await orderService.getStats(tenantId || undefined);

    return res.json(successResponse(stats));
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json(
      errorResponse('Error al obtener estadísticas')
    );
  }
};

/**
 * @route   GET /api/orders/customer/:phone
 * @desc    Buscar pedidos por teléfono del cliente
 * @access  Private
 */
export const getByCustomerPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;

    const orders = await orderService.findByCustomerPhone(phone);

    return res.json(successResponse(orders));
  } catch (error: any) {
    console.error('Error al buscar pedidos:', error);
    return res.status(500).json(
      errorResponse('Error al buscar pedidos del cliente')
    );
  }
};

