import { PrismaClient, OrderStatus } from '@prisma/client';
import { CreateOrderInput, OrderFiltersInput } from '../validators/order.validator';

const prisma = new PrismaClient();

export class OrderService {
  /**
   * Generar número de pedido único
   * Formato: YYMMDDXXXX
   */
  private async generateOrderNumber(tenantId?: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    // Obtener el último pedido del día para este tenant
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const where: any = {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
      orderNumber: {
        startsWith: datePrefix,
      },
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const lastOrder = await prisma.order.findFirst({
      where,
      orderBy: {
        orderNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${datePrefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Crear un nuevo pedido
   */
  async create(data: CreateOrderInput, tenantId: string) {
    const orderNumber = await this.generateOrderNumber(tenantId);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        items: data.items as any,
        customer: data.customer as any,
        delivery: data.delivery as any,
        payment: data.payment as any,
        subtotal: data.subtotal,
        total: data.total,
        notes: data.notes,
        status: OrderStatus.PREPARING, // Siempre empieza en PREPARING
        tenantId,
      },
    });

    return order;
  }

  /**
   * Obtener todos los pedidos con filtros y paginación
   */
  async findAll(filters: OrderFiltersInput & { tenantId?: string }) {
    const { status, customerPhone, dateFrom, dateTo, search, page, limit, tenantId } = filters;

    const where: any = {};

    // Filtrar por tenant
    if (tenantId) {
      where.tenantId = tenantId;
    }

    // Filtrar por estado
    if (status) {
      where.status = status.toUpperCase();
    }

    // Filtrar por rango de fechas
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Buscar por teléfono del cliente (en JSON)
    if (customerPhone) {
      where.customer = {
        path: ['phone'],
        equals: customerPhone,
      };
    }

    // Buscar en orderNumber o customer.name
    if (search) {
      where.OR = [
        {
          orderNumber: {
            contains: search,
          },
        },
        {
          customer: {
            path: ['name'],
            string_contains: search,
          },
        },
      ];
    }

    // Calcular paginación
    const skip = (page - 1) * limit;

    // Obtener total de registros
    const total = await prisma.order.count({ where });

    // Obtener pedidos
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un pedido por ID
   */
  async findById(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const order = await prisma.order.findFirst({
      where,
    });

    return order;
  }

  /**
   * Actualizar estado del pedido
   */
  async updateStatus(id: string, data: { status: string }, tenantId?: string) {
    // Verificar que el pedido existe y pertenece al tenant
    const order = await this.findById(id, tenantId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // Normalizar estados a mayúsculas para comparación
    const currentStatus = order.status.toUpperCase();
    const newStatus = data.status.toUpperCase();

    console.log(`📦 [UPDATE STATUS] Pedido: ${id}, Estado actual: ${currentStatus}, Nuevo estado: ${newStatus}`);

    // Si el estado es el mismo, no hacer nada
    if (currentStatus === newStatus) {
      console.log(`ℹ️ [UPDATE STATUS] El pedido ya tiene el estado ${currentStatus}`);
      return order;
    }

    // No se puede cambiar de DELIVERED o CANCELLED a otros estados
    if (currentStatus === 'DELIVERED') {
      throw new Error('Este pedido ya fue entregado y no se puede modificar su estado');
    }

    if (currentStatus === 'CANCELLED') {
      throw new Error('Este pedido está cancelado y no se puede modificar su estado');
    }

    // Actualizar estado
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus as OrderStatus,
      },
    });

    console.log(`✅ [UPDATE STATUS] Pedido ${id} actualizado a ${newStatus}`);

    return updatedOrder;
  }

  /**
   * Eliminar un pedido
   */
  async delete(id: string, tenantId?: string) {
    // Verificar que el pedido existe y pertenece al tenant
    const order = await this.findById(id, tenantId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // No se puede eliminar pedidos entregados
    if (order.status === OrderStatus.DELIVERED) {
      throw new Error('No se puede eliminar un pedido entregado');
    }

    await prisma.order.delete({
      where: { id },
    });
  }

  /**
   * Obtener estadísticas de pedidos
   */
  async getStats(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};

    // Total de pedidos
    const total = await prisma.order.count({ where });

    // Contar por estado (solo 2 estados)
    const preparing = await prisma.order.count({ where: { ...where, status: OrderStatus.PREPARING } });
    const delivered = await prisma.order.count({ where: { ...where, status: OrderStatus.DELIVERED } });

    // Pedidos de hoy
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayTotal = await prisma.order.count({
      where: {
        ...where,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Ingresos de hoy (todos los pedidos cuentan para ingresos)
    const todayOrders = await prisma.order.findMany({
      where: {
        ...where,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        total: true,
      },
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);

    return {
      total,
      preparing,
      delivered,
      todayTotal,
      todayRevenue,
    };
  }

  /**
   * Buscar pedidos por teléfono del cliente
   */
  async findByCustomerPhone(phone: string) {
    const orders = await prisma.order.findMany({
      where: {
        customer: {
          path: ['phone'],
          equals: phone,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }
}

