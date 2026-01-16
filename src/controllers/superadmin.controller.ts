import { Request, Response } from 'express';
import { TenantsService } from '../services/tenant.service';
import logsService from '../services/logs.service';
import { successResponse, errorResponse } from '../utils/response';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const tenantsService = new TenantsService();

export class SuperAdminController {
  /**
   * Obtener dashboard del SuperAdmin
   * GET /api/superadmin/dashboard
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const [tenantStats, logStats, recentTenants, recentLogs, totalUsers] =
        await Promise.all([
          this.getTenantStats(),
          logsService.getStats(),
          tenantsService.findAll({ page: 1, limit: 5 }),
          logsService.getRecent(10),
          prisma.user.count(),
        ]);

      return res.json(
        successResponse(
          {
            tenantStats,
            logStats,
            recentTenants: recentTenants.data,
            recentLogs,
            totalUsers,
          },
          'Dashboard obtenido exitosamente'
        )
      );
    } catch (error: any) {
      console.error('Error al obtener dashboard:', error);
      return res
        .status(500)
        .json(errorResponse('Error al obtener el dashboard'));
    }
  }

  /**
   * Obtener estadísticas de tenants
   */
  private async getTenantStats() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      inactiveTenants,
      newTenantsThisMonth,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'active' } }),
      prisma.tenant.count({ where: { status: 'suspended' } }),
      prisma.tenant.count({ where: { status: 'inactive' } }),
      prisma.tenant.count({
        where: {
          createdAt: {
            gte: thisMonth,
          },
        },
      }),
    ]);

    return {
      totalTenants,
      activeTenants,
      suspendedTenants,
      inactiveTenants,
      newTenantsThisMonth,
    };
  }

  /**
   * Obtener estadísticas generales del sistema
   * GET /api/superadmin/stats
   */
  async getStats(req: Request, res: Response) {
    try {
      const [
        tenantStats,
        logStats,
        userStats,
        orderStats,
        dishStats,
      ] = await Promise.all([
        this.getTenantStats(),
        logsService.getStats(),
        this.getUserStats(),
        this.getOrderStats(),
        this.getDishStats(),
      ]);

      return res.json(
        successResponse(
          {
            tenantStats,
            logStats,
            userStats,
            orderStats,
            dishStats,
          },
          'Estadísticas obtenidas exitosamente'
        )
      );
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      return res
        .status(500)
        .json(errorResponse('Error al obtener estadísticas'));
    }
  }

  /**
   * Estadísticas de usuarios
   */
  private async getUserStats() {
    const [total, superAdmins, admins, ordersManagers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SUPERADMIN' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'ORDERS_MANAGER' } }),
    ]);

    return {
      total,
      superAdmins,
      admins,
      ordersManagers,
    };
  }

  /**
   * Estadísticas de órdenes
   */
  private async getOrderStats() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, thisMonthCount, totalRevenue] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          createdAt: {
            gte: thisMonth,
          },
        },
      }),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
    ]);

    return {
      total,
      thisMonth: thisMonthCount,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  }

  /**
   * Estadísticas de platos
   */
  private async getDishStats() {
    const [total, active, inactive] = await Promise.all([
      prisma.dish.count(),
      prisma.dish.count({ where: { isActive: true } }),
      prisma.dish.count({ where: { isActive: false } }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }
}

export default new SuperAdminController();

