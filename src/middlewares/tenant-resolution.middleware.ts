import { Request, Response, NextFunction } from 'express';
import { PrismaClient, TenantStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Extender Request para incluir tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        name: string;
        domain: string;
        settings: any;
        plan: string;
        status: string;
      };
    }
  }
}

export const tenantResolutionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Excluir rutas de SuperAdmin, Auth y públicas de resolución de tenant
    const excludedPaths = [
      '/api/auth',
      '/api/tenants/domain',
      '/api/tenants',
      '/api/logs',
      '/api/superadmin',
      '/api/health',
      '/api-docs',
    ];

    if (excludedPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Obtener dominio del header
    const domain = req.headers['x-tenant-domain'] as string;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Tenant domain not provided',
        message: 'El header x-tenant-domain es requerido',
      });
    }

    // Buscar tenant por dominio o customDomain
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { domain },
          { customDomain: domain },
        ],
        status: {
          in: [TenantStatus.active, TenantStatus.suspended], // Permitir suspended para mostrar mensaje
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
        message: 'No se encontró un tenant para este dominio',
      });
    }

    // Si el tenant está suspendido, retornar error especial
    if (tenant.status === TenantStatus.suspended) {
      return res.status(403).json({
        success: false,
        error: 'Tenant suspended',
        message: 'Este tenant ha sido suspendido temporalmente',
      });
    }

    // Adjuntar tenant al request
    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      settings: tenant.settings,
      plan: tenant.plan,
      status: tenant.status,
    };

    next();
  } catch (error) {
    console.error('Error in tenant resolution middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Error al resolver el tenant',
    });
  }
};

