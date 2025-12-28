import { Router } from 'express';
import dishController from '../controllers/dish.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/dishes
 * @desc    Get all dishes with filters
 * @access  Public
 */
router.get('/', dishController.getAll);

/**
 * @route   GET /api/dishes/:id
 * @desc    Get dish by ID
 * @access  Public
 */
router.get('/:id', dishController.getById);

/**
 * @route   GET /api/dishes/slug/:slug
 * @desc    Get dish by slug
 * @access  Public
 */
router.get('/slug/:slug', dishController.getBySlug);

/**
 * @route   POST /api/dishes
 * @desc    Create a new dish
 * @access  Private (Admin/Editor)
 */
router.post('/', authMiddleware, dishController.create);

/**
 * @route   PUT /api/dishes/:id
 * @desc    Update a dish
 * @access  Private (Admin/Editor)
 */
router.put('/:id', authMiddleware, dishController.update);

/**
 * @route   DELETE /api/dishes/:id
 * @desc    Delete a dish
 * @access  Private (Admin/Editor)
 */
router.delete('/:id', authMiddleware, dishController.delete);

/**
 * @route   POST /api/dishes/reorder
 * @desc    Reorder dishes
 * @access  Private (Admin/Editor)
 */
router.post('/reorder', authMiddleware, dishController.reorder);

export default router;

