import { Router } from 'express';
import logsController from '../controllers/logs.controller';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Todas las rutas de logs requieren autenticación y rol SUPERADMIN
 */
router.use(authMiddleware);
router.use(requireRole(['SUPERADMIN']));

/**
 * @route   GET /api/logs/stats
 * @desc    Obtener estadísticas de logs
 * @access  SUPERADMIN
 */
router.get('/stats', logsController.getStats.bind(logsController));

/**
 * @route   GET /api/logs/recent
 * @desc    Obtener logs recientes (últimas 24h)
 * @access  SUPERADMIN
 */
router.get('/recent', logsController.getRecent.bind(logsController));

/**
 * @route   GET /api/logs/action/:action
 * @desc    Obtener logs por acción específica
 * @access  SUPERADMIN
 */
router.get('/action/:action', logsController.getByAction.bind(logsController));

/**
 * @route   GET /api/logs
 * @desc    Obtener todos los logs con filtros
 * @access  SUPERADMIN
 */
router.get('/', logsController.findAll.bind(logsController));

export default router;

