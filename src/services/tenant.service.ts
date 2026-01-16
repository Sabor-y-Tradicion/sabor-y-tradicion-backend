import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import logsService from './logs.service';

const prisma = new PrismaClient();

export class TenantsService {
  async findByDomain(domain: string) {
    // Extraer el slug del dominio (ej: "saborytradicion" de "saborytradicion.james.pe")
    const slug = domain.split('.')[0];

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { domain },
          { customDomain: domain },
          { slug }, // Buscar también por slug para compatibilidad
        ],
        status: 'active', // Solo tenants activos
      },
      include: {
        _count: {
          select: {
            users: true,
            dishes: true,
            categories: true,
            orders: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    return {
      success: true,
      data: tenant,
    };
  }

  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    plan?: string;
    search?: string;
  }) {
    const { page, limit, status, plan, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (plan) {
      where.plan = plan;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              users: true,
              dishes: true,
              categories: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            dishes: true,
            categories: true,
            orders: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    return {
      success: true,
      data: tenant,
    };
  }

  async create(
    createDto: {
      name: string;
      slug: string;
      domain?: string;
      email: string;
      plan?: string;
      settings?: any;
      adminEmail: string;
      adminName: string;
      adminPassword: string;
    },
    createdBy?: { userId: string; userEmail: string; ipAddress?: string; userAgent?: string }
  ) {
    // Validar slug y domain únicos
    const existing = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: createDto.slug },
          { domain: createDto.domain || `${createDto.slug}.james.pe` },
        ],
      },
    });

    if (existing) {
      throw new Error('Slug o dominio ya existe');
    }

    // Crear tenant y admin en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear tenant
      const tenant = await tx.tenant.create({
        data: {
          name: createDto.name,
          slug: createDto.slug,
          domain: createDto.domain || `${createDto.slug}.james.pe`,
          email: createDto.email,
          plan: (createDto.plan as any) || 'free',
          settings: createDto.settings || {},
        },
      });

      // Crear usuario admin del tenant
      const hashedPassword = await bcrypt.hash(createDto.adminPassword, 10);
      const admin = await tx.user.create({
        data: {
          email: createDto.adminEmail,
          password: hashedPassword,
          name: createDto.adminName,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      return { tenant, admin };
    });

    // Registrar en logs
    await logsService.create({
      level: 'info',
      action: 'tenant_created',
      message: `Tenant creado: ${result.tenant.name}`,
      details: {
        tenantId: result.tenant.id,
        tenantName: result.tenant.name,
        adminEmail: createDto.adminEmail,
        slug: createDto.slug,
        domain: result.tenant.domain,
      },
      userId: createdBy?.userId,
      userEmail: createdBy?.userEmail,
      tenantId: result.tenant.id,
      tenantName: result.tenant.name,
      ipAddress: createdBy?.ipAddress,
      userAgent: createdBy?.userAgent,
    });

    console.log('✅ Tenant creado:', result.tenant.name);
    console.log('✅ Admin creado:', result.admin.email);

    // Determinar URL de acceso según el entorno
    const isDevelopment = process.env.NODE_ENV === 'development';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    let accessUrl;
    if (isDevelopment) {
      // En desarrollo, usar localhost con el slug como identificador
      accessUrl = `${frontendUrl}?tenant=${result.tenant.slug}`;
    } else {
      // En producción, usar el subdominio
      accessUrl = `https://${result.tenant.domain}`;
    }

    return {
      success: true,
      data: {
        ...result.tenant,
        accessUrl, // URL de acceso según el entorno
        adminEmail: result.admin.email,
      },
    };
  }

  async update(id: string, updateDto: any, user: any) {
    // Verificar permisos
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    if (user.role !== 'SUPERADMIN' && user.tenantId !== id) {
      throw new Error('No tienes permiso para editar este tenant');
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: updateDto,
    });

    return {
      success: true,
      data: updated,
    };
  }

  async updateSettings(id: string, settings: any, user: any) {
    console.log('🔧 [SERVICE] updateSettings llamado');
    console.log('🔧 [SERVICE] Tenant ID:', id);
    console.log('🔧 [SERVICE] Settings a guardar:', JSON.stringify(settings, null, 2));

    // Verificar permisos
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    if (user.role !== 'SUPERADMIN' && user.tenantId !== id) {
      throw new Error('No tienes permiso para editar este tenant');
    }

    const currentSettings = tenant.settings as any || {};
    console.log('🔧 [SERVICE] Settings actuales:', JSON.stringify(currentSettings, null, 2));

    const mergedSettings = { ...currentSettings, ...settings };
    console.log('🔧 [SERVICE] Settings merged:', JSON.stringify(mergedSettings, null, 2));

    const updated = await prisma.tenant.update({
      where: { id },
      data: { settings: mergedSettings },
    });

    console.log('✅ [SERVICE] Tenant actualizado, settings guardados:', JSON.stringify(updated.settings, null, 2));

    return {
      success: true,
      data: updated,
    };
  }

  async updateStatus(
    id: string,
    status: string,
    updatedBy?: { userId: string; userEmail: string; ipAddress?: string; userAgent?: string }
  ) {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: { status: status as any },
    });

    // Registrar en logs
    const action = status === 'suspended' ? 'tenant_suspended' : 'tenant_activated';
    const level = status === 'suspended' ? 'warning' : 'info';

    await logsService.create({
      level: level as any,
      action: action as any,
      message: `Tenant ${status === 'suspended' ? 'suspendido' : 'activado'}: ${updated.name}`,
      details: {
        previousStatus: tenant.status,
        newStatus: status,
      },
      userId: updatedBy?.userId,
      userEmail: updatedBy?.userEmail,
      tenantId: updated.id,
      tenantName: updated.name,
      ipAddress: updatedBy?.ipAddress,
      userAgent: updatedBy?.userAgent,
    });

    return {
      success: true,
      data: updated,
    };
  }

  async remove(id: string) {
    // Verificar que no sea el único tenant (opcional)
    const count = await prisma.tenant.count();
    if (count === 1) {
      throw new Error('No puedes eliminar el último tenant');
    }

    await prisma.tenant.delete({ where: { id } });

    return {
      success: true,
      message: 'Tenant eliminado exitosamente',
    };
  }

  async getStats(id: string) {
    const [tenant, orderStats] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              dishes: true,
              categories: true,
              orders: true,
            },
          },
        },
      }),
      prisma.order.aggregate({
        where: { tenantId: id },
        _sum: { total: true },
      }),
    ]);

    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    // Calcular pedidos este mes
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const ordersThisMonth = await prisma.order.count({
      where: {
        tenantId: id,
        createdAt: { gte: thisMonth },
      },
    });

    // Calcular ingresos de este mes
    const revenueThisMonthResult = await prisma.order.aggregate({
      where: {
        tenantId: id,
        createdAt: { gte: thisMonth },
      },
      _sum: { total: true },
    });

    return {
      success: true,
      data: {
        totalOrders: tenant._count.orders,
        totalRevenue: orderStats._sum.total || 0,
        activeUsers: tenant._count.users,
        activeDishes: tenant._count.dishes,
        activeCategories: tenant._count.categories,
        ordersThisMonth,
        revenueThisMonth: revenueThisMonthResult._sum.total || 0,
      },
    };
  }

  async verifyDomain(id: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant || !tenant.customDomain) {
      throw new Error('Tenant o dominio personalizado no encontrado');
    }

    try {
      // Nota: La verificación DNS requiere el módulo 'dns' nativo de Node.js
      // Por simplicidad, aquí solo retornamos un mensaje
      return {
        success: true,
        data: {
          verified: false,
          message: 'Verificación de dominio no implementada. Configure el CNAME manualmente.',
        },
      };
    } catch (error) {
      return {
        success: true,
        data: {
          verified: false,
          message: 'No se pudo verificar el dominio. Asegúrate de configurar el CNAME correctamente.',
        },
      };
    }
  }
}

