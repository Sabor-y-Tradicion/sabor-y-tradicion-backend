import { Router } from 'express';
import dishController from '../controllers/dish.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/dishes:
 *   get:
 *     summary: Listar todos los platos con filtros
 *     tags: [Platos]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en nombre y descripción
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Destacados
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de platos con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dish'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', dishController.getAll);

/**
 * @swagger
 * /api/dishes/{id}:
 *   get:
 *     summary: Obtener plato por ID
 *     tags: [Platos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plato
 *     responses:
 *       200:
 *         description: Plato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       404:
 *         description: Plato no encontrado
 */
router.get('/:id', dishController.getById);

/**
 * @swagger
 * /api/dishes/slug/{slug}:
 *   get:
 *     summary: Obtener plato por slug
 *     tags: [Platos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del plato
 *     responses:
 *       200:
 *         description: Plato encontrado
 *       404:
 *         description: Plato no encontrado
 */
router.get('/slug/:slug', dishController.getBySlug);

/**
 * @swagger
 * /api/dishes:
 *   post:
 *     summary: Crear nuevo plato
 *     tags: [Platos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDishInput'
 *           example:
 *             name: "Lomo Saltado"
 *             description: "Delicioso lomo saltado con papas fritas"
 *             price: 25.50
 *             categoryId: "category_id_here"
 *             imageUrl: "https://ejemplo.com/lomo.jpg"
 *             isActive: true
 *             isFeatured: true
 *             allergens: ["gluten"]
 *             order: 0
 *             tags: []
 *     responses:
 *       201:
 *         description: Plato creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Error de validación
 */
router.post('/', authMiddleware, dishController.create);

/**
 * @swagger
 * /api/dishes/{id}:
 *   put:
 *     summary: Actualizar plato
 *     tags: [Platos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDishInput'
 *     responses:
 *       200:
 *         description: Plato actualizado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Plato no encontrado
 */
router.put('/:id', authMiddleware, dishController.update);

/**
 * @swagger
 * /api/dishes/{id}:
 *   delete:
 *     summary: Eliminar plato
 *     tags: [Platos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plato eliminado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Plato no encontrado
 */
router.delete('/:id', authMiddleware, dishController.delete);

/**
 * @swagger
 * /api/dishes/reorder:
 *   post:
 *     summary: Reordenar platos
 *     tags: [Platos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dishIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["dish_id_1", "dish_id_2", "dish_id_3"]
 *     responses:
 *       200:
 *         description: Platos reordenados
 *       401:
 *         description: No autorizado
 */
router.post('/reorder', authMiddleware, dishController.reorder);

export default router;

