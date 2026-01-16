import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - dish
 *         - quantity
 *         - subtotal
 *       properties:
 *         dish:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             price:
 *               type: number
 *             image:
 *               type: string
 *             description:
 *               type: string
 *         quantity:
 *           type: integer
 *         subtotal:
 *           type: number
 *
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - documentType
 *       properties:
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *           pattern: '^\+51\d{9}$'
 *         documentType:
 *           type: string
 *           enum: [boleta, factura]
 *         documentNumber:
 *           type: string
 *         businessName:
 *           type: string
 *         businessAddress:
 *           type: string
 *
 *     Delivery:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum: [delivery, pickup]
 *         address:
 *           type: string
 *
 *     Payment:
 *       type: object
 *       required:
 *         - method
 *       properties:
 *         method:
 *           type: string
 *           enum: [efectivo, tarjeta, billetera]
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         orderNumber:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         delivery:
 *           $ref: '#/components/schemas/Delivery'
 *         payment:
 *           $ref: '#/components/schemas/Payment'
 *         subtotal:
 *           type: number
 *         total:
 *           type: number
 *         status:
 *           type: string
 *           enum: [PENDING, PREPARING, READY, DELIVERED, CANCELLED]
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateOrderInput:
 *       type: object
 *       required:
 *         - items
 *         - customer
 *         - delivery
 *         - payment
 *         - subtotal
 *         - total
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         delivery:
 *           $ref: '#/components/schemas/Delivery'
 *         payment:
 *           $ref: '#/components/schemas/Payment'
 *         subtotal:
 *           type: number
 *         total:
 *           type: number
 *         notes:
 *           type: string
 *
 *     UpdateOrderStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [preparing, delivered]
 *
 *     OrderStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         pending:
 *           type: integer
 *         preparing:
 *           type: integer
 *         ready:
 *           type: integer
 *         delivered:
 *           type: integer
 *         cancelled:
 *           type: integer
 *         todayTotal:
 *           type: integer
 *         todayRevenue:
 *           type: number
 */

/**
 * @swagger
 * /api/orders/public:
 *   post:
 *     summary: Crear un nuevo pedido (PÚBLICO - Sin autenticación)
 *     description: Este endpoint es usado por los clientes del restaurante para hacer pedidos. NO requiere autenticación, pero requiere el header X-Tenant-Domain.
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Dominio del tenant (ej saborytradicion.james.pe)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Datos inválidos o falta X-Tenant-Domain
 *       404:
 *         description: Tenant no encontrado
 */
router.post('/public', orderController.createPublic);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 */
router.post('/', orderController.create);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Obtener estadísticas de pedidos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/OrderStats'
 */
router.get('/stats', authMiddleware, orderController.getStats);

/**
 * @swagger
 * /api/orders/customer/{phone}:
 *   get:
 *     summary: Buscar pedidos por teléfono del cliente
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Teléfono del cliente (+51XXXXXXXXX)
 *     responses:
 *       200:
 *         description: Pedidos encontrados
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
 *                     $ref: '#/components/schemas/Order'
 */
router.get('/customer/:phone', authMiddleware, orderController.getByCustomerPhone);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Obtener todos los pedidos con filtros
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [preparing, delivered]
 *         description: Filtrar por estado
 *       - in: query
 *         name: customerPhone
 *         schema:
 *           type: string
 *         description: Filtrar por teléfono del cliente
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha desde (ISO 8601)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha hasta (ISO 8601)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en número de pedido o nombre del cliente
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
 *           default: 50
 *           maximum: 100
 *         description: Items por página
 *     responses:
 *       200:
 *         description: Lista de pedidos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Order'
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
router.get('/', authMiddleware, orderController.getAll);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener un pedido por ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id', authMiddleware, orderController.getById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Actualizar estado del pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusInput'
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *       400:
 *         description: Estado inválido o transición no permitida
 *       404:
 *         description: Pedido no encontrado
 */
router.patch('/:id/status', authMiddleware, orderController.updateStatus);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Eliminar un pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: No se puede eliminar pedidos entregados
 *       404:
 *         description: Pedido no encontrado
 */
router.delete('/:id', authMiddleware, orderController.deleteOrder);

export default router;

