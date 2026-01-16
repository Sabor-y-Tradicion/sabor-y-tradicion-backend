import { Router } from 'express';
import tenantsController from '../controllers/tenant.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { createTenantSchema, updateTenantSchema, updateTenantSettingsSchema, validate } from '../validators/tenant.validator';

const router = Router();

/**
 * Rutas públicas
 */
// Obtener tenant por dominio (público)
router.get('/domain/:domain', tenantsController.getByDomain.bind(tenantsController));

/**
 * Rutas SUPERADMIN
 */
// Listar todos los tenants
router.get(
  '/',
  authMiddleware,
  requireRole(['SUPERADMIN']),
  tenantsController.findAll.bind(tenantsController)
);

// Obtener tenant por ID
router.get(
  '/:id',
  authMiddleware,
  requireRole(['SUPERADMIN']),
  tenantsController.findOne.bind(tenantsController)
);

// Crear nuevo tenant
router.post(
  '/',
  authMiddleware,
  requireRole(['SUPERADMIN']),
  // Validación se hace en el controlador
  tenantsController.create.bind(tenantsController)
);

// Actualizar tenant
router.patch(
  '/:id',
  authMiddleware,
  requireRole(['SUPERADMIN', 'ADMIN']),
  validate(updateTenantSchema),
  tenantsController.update.bind(tenantsController)
);

// Actualizar configuración del tenant (PATCH)
router.patch(
  '/:id/settings',
  authMiddleware,
  requireRole(['SUPERADMIN', 'ADMIN']),
  validate(updateTenantSettingsSchema),
  tenantsController.updateSettings.bind(tenantsController)
);

// Actualizar configuración del tenant (PUT) - Alias para compatibilidad
router.put(
  '/:id/settings',
  authMiddleware,
  requireRole(['SUPERADMIN', 'ADMIN']),
  validate(updateTenantSettingsSchema),
  tenantsController.updateSettings.bind(tenantsController)
);

// Suspender tenant
router.patch(
  '/:id/suspend',
  authMiddleware,
  requireRole(['SUPERADMIN']),
  tenantsController.suspend.bind(tenantsController)
);

// Activar tenant
router.patch(
  '/:id/activate',
  authMiddleware,
  requireRole(['SUPERADMIN']),
  tenantsController.activate.bind(tenantsController)
);

// Eliminar tenant
router.delete(
  '/:id',
  authMiddleware,
  requireRole(['SUPERADMIN']),
  tenantsController.remove.bind(tenantsController)
);

// Obtener estadísticas del tenant
router.get(
  '/:id/stats',
  authMiddleware,
  requireRole(['SUPERADMIN', 'ADMIN']),
  tenantsController.getStats.bind(tenantsController)
);

// Verificar dominio DNS
router.post(
  '/:id/verify-domain',
  authMiddleware,
  requireRole(['SUPERADMIN', 'ADMIN']),
  tenantsController.verifyDomain.bind(tenantsController)
);

export default router;

