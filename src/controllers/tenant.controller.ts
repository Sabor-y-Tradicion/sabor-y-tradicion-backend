import { Request, Response } from 'express';
import { TenantsService } from '../services/tenant.service';
import { AuthenticatedRequest } from '../middlewares/tenant-isolation.middleware';
import { createTenantSchema } from '../validators/tenant.validator';

const tenantsService = new TenantsService();

console.log('🔄 TenantsController cargado - NUEVA VERSIÓN con validación');

export class TenantsController {
  /**
   * Obtener tenant por dominio (público)
   * GET /api/tenants/domain/:domain
   */
  async getByDomain(req: Request, res: Response) {
    try {
      const { domain } = req.params;
      const result = await tenantsService.findByDomain(domain);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Listar todos los tenants (SUPERADMIN)
   * GET /api/tenants
   */
  async findAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const status = req.query.status as string;
      const plan = req.query.plan as string;
      const search = req.query.search as string;

      const result = await tenantsService.findAll({
        page,
        limit,
        status,
        plan,
        search,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener tenant por ID (SUPERADMIN)
   * GET /api/tenants/:id
   */
  async findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await tenantsService.findOne(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Crear nuevo tenant (SUPERADMIN)
   * POST /api/tenants
   */
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      console.log('📦 [CREATE TENANT] Datos recibidos:', JSON.stringify(req.body, null, 2));

      // Validar con Zod - SOLO acepta estos 5 campos
      const validatedData = createTenantSchema.parse(req.body);

      console.log('✅ [CREATE TENANT] Datos validados correctamente');

      // Mapear campos del frontend al backend
      const tenantData = {
        name: validatedData.name,
        slug: validatedData.subdomain,  // subdomain → slug
        domain: undefined,  // Se generará automáticamente
        email: validatedData.adminEmail,  // adminEmail → email del tenant
        plan: undefined,  // default: 'free'
        settings: undefined,  // default: {}
        adminEmail: validatedData.adminEmail,
        adminName: validatedData.adminName,
        adminPassword: validatedData.adminPassword,
      };

      console.log('📤 [CREATE TENANT] Enviando a servicio...');

      const result = await tenantsService.create(tenantData, {
        userId: req.user?.id || '',
        userEmail: req.user?.email || '',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      console.log('✅ [CREATE TENANT] Tenant creado exitosamente:', result.data.name);
      res.status(201).json(result);
    } catch (error: any) {
      console.log('❌ [CREATE TENANT] Error:', error.message);

      // Si es error de validación de Zod
      if (error.name === 'ZodError') {
        console.log('❌ [CREATE TENANT] Errores de validación:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          message: 'Los datos no cumplen con el formato requerido',
        });
      }

      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Actualizar tenant (SUPERADMIN o ADMIN del tenant)
   * PATCH /api/tenants/:id
   */
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await tenantsService.update(id, req.body, req.user);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Actualizar configuración del tenant
   * PATCH /api/tenants/:id/settings
   * PUT /api/tenants/:id/settings
   */
  async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      // Aceptar settings directamente del body O envueltos en { settings: ... }
      const settings = req.body.settings || req.body;

      console.log('📦 [UPDATE SETTINGS] Tenant ID:', id);
      console.log('📦 [UPDATE SETTINGS] Body recibido:', JSON.stringify(req.body, null, 2));
      console.log('📦 [UPDATE SETTINGS] Settings a guardar:', JSON.stringify(settings, null, 2));

      const result = await tenantsService.updateSettings(id, settings, req.user);

      console.log('✅ [UPDATE SETTINGS] Resultado:', JSON.stringify(result.data?.settings, null, 2));
      res.json(result);
    } catch (error: any) {
      console.log('❌ [UPDATE SETTINGS] Error:', error.message);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Suspender tenant (SUPERADMIN)
   * PATCH /api/tenants/:id/suspend
   */
  async suspend(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await tenantsService.updateStatus(id, 'suspended', {
        userId: req.user?.id || '',
        userEmail: req.user?.email || '',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Activar tenant (SUPERADMIN)
   * PATCH /api/tenants/:id/activate
   */
  async activate(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await tenantsService.updateStatus(id, 'active', {
        userId: req.user?.id || '',
        userEmail: req.user?.email || '',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Eliminar tenant (SUPERADMIN)
   * DELETE /api/tenants/:id
   */
  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await tenantsService.remove(id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas del tenant
   * GET /api/tenants/:id/stats
   */
  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await tenantsService.getStats(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Verificar dominio DNS
   * POST /api/tenants/:id/verify-domain
   */
  async verifyDomain(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await tenantsService.verifyDomain(id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

// Exportar instancia para las rutas
export default new TenantsController();


