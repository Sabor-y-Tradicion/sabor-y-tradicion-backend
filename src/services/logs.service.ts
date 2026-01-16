import { PrismaClient, LogLevel, LogAction } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateLogDto {
  level: LogLevel;
  action: LogAction;
  message: string;
  details?: any;
  userId?: string;
  userEmail?: string;
  tenantId?: string;
  tenantName?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogFilters {
  level?: LogLevel;
  action?: LogAction;
  userId?: string;
  tenantId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class LogsService {
  /**
   * Crear un nuevo log
   */
  async create(data: CreateLogDto) {
    try {
      return await prisma.log.create({
        data: {
          level: data.level,
          action: data.action,
          message: data.message,
          details: data.details || null,
          userId: data.userId || null,
          userEmail: data.userEmail || null,
          tenantId: data.tenantId || null,
          tenantName: data.tenantName || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      });
    } catch (error) {
      console.error('Error creating log:', error);
      // No lanzar error para evitar interrumpir el flujo principal
      return null;
    }
  }

  /**
   * Obtener logs con filtros
   */
  async findAll(filters: LogFilters) {
    const where: any = {};

    if (filters.level) where.level = filters.level;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.tenantId) where.tenantId = filters.tenantId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.log.count({ where }),
    ]);

    return {
      data: logs,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  /**
   * Obtener estadísticas de logs
   */
  async getStats() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalLogs, errorLogs, warningLogs, recentLogs] = await Promise.all([
      prisma.log.count(),
      prisma.log.count({ where: { level: 'error' } }),
      prisma.log.count({ where: { level: 'warning' } }),
      prisma.log.count({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo,
          },
        },
      }),
    ]);

    return {
      totalLogs,
      errorLogs,
      warningLogs,
      recentLogs,
    };
  }

  /**
   * Obtener logs por acción
   */
  async getByAction(action: LogAction, limit: number = 10) {
    return await prisma.log.findMany({
      where: { action },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tenant: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Obtener logs recientes (últimas 24h)
   */
  async getRecent(limit: number = 50) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await prisma.log.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tenant: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export default new LogsService();

