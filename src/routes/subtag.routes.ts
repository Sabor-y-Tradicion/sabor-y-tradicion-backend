import { Router } from 'express';
import subtagController from '../controllers/subtag.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantResolutionMiddleware } from '../middlewares/tenant-resolution.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Subtag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del subtag
 *         name:
 *           type: string
 *           description: Nombre del subtag
 *         tenantId:
 *           type: string
 *           description: ID del tenant al que pertenece
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateSubtagInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Nombre del subtag
 *           example: "Vegetariano"
 *
 *     UpdateSubtagInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Nuevo nombre del subtag
 *           example: "Vegetariano Estricto"
 */

/**
 * @swagger
 * /api/subtags:
 *   get:
 *     summary: Obtener todos los subtags
 *     tags: [Subtags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Dominio del tenant
 *     responses:
 *       200:
 *         description: Lista de subtags obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Subtag'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get('/', authMiddleware, tenantResolutionMiddleware, subtagController.getAll);

/**
 * @swagger
 * /api/subtags/{id}:
 *   get:
 *     summary: Obtener un subtag por ID
 *     tags: [Subtags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subtag
 *       - in: header
 *         name: X-Tenant-Domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Dominio del tenant
 *     responses:
 *       200:
 *         description: Subtag encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subtag'
 *       404:
 *         description: Subtag no encontrado
 */
router.get('/:id', authMiddleware, tenantResolutionMiddleware, subtagController.getById);

/**
 * @swagger
 * /api/subtags:
 *   post:
 *     summary: Crear un nuevo subtag
 *     tags: [Subtags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Dominio del tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubtagInput'
 *     responses:
 *       201:
 *         description: Subtag creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subtag'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos o subtag duplicado
 */
router.post('/', authMiddleware, tenantResolutionMiddleware, subtagController.create);

/**
 * @swagger
 * /api/subtags/{id}:
 *   patch:
 *     summary: Actualizar un subtag
 *     tags: [Subtags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subtag
 *       - in: header
 *         name: X-Tenant-Domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Dominio del tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubtagInput'
 *     responses:
 *       200:
 *         description: Subtag actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subtag'
 *                 message:
 *                   type: string
 *       404:
 *         description: Subtag no encontrado
 *       400:
 *         description: Datos inválidos o nombre duplicado
 */
router.patch('/:id', authMiddleware, tenantResolutionMiddleware, subtagController.update);

/**
 * @swagger
 * /api/subtags/{id}:
 *   delete:
 *     summary: Eliminar un subtag
 *     tags: [Subtags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subtag
 *       - in: header
 *         name: X-Tenant-Domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Dominio del tenant
 *     responses:
 *       200:
 *         description: Subtag eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Subtag no encontrado
 */
router.delete('/:id', authMiddleware, tenantResolutionMiddleware, subtagController.delete);

export default router;

