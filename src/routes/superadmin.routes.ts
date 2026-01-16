import { Router } from 'express';
import superAdminController from '../controllers/superadmin.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Todas las rutas de superadmin requieren autenticación y rol SUPERADMIN
 */
router.use(authMiddleware);
router.use(requireRole(['SUPERADMIN']));

/**
 * @route   GET /api/superadmin/dashboard
 * @desc    Obtener dashboard del SuperAdmin
 * @access  SUPERADMIN
 */
router.get('/dashboard', superAdminController.getDashboard.bind(superAdminController));

/**
 * @route   GET /api/superadmin/stats
 * @desc    Obtener estadísticas generales del sistema
 * @access  SUPERADMIN
 */
router.get('/stats', superAdminController.getStats.bind(superAdminController));

export default router;

