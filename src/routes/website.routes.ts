import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as websiteController from '../controllers/website.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Website
 *   description: Gestión de la configuración del sitio web del restaurante
 */

/**
 * @swagger
 * /api/website:
 *   get:
 *     summary: Obtener configuración pública del sitio web
 *     tags: [Website]
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Dominio del tenant (ej. saborytradicion.james.pe)
 *     responses:
 *       200:
 *         description: Configuración del sitio web
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     tenantId:
 *                       type: string
 *                     tenantName:
 *                       type: string
 *                     config:
 *                       type: object
 *       404:
 *         description: Restaurante no encontrado
 */
router.get('/', websiteController.getPublicConfig);

/**
 * @swagger
 * /api/website/admin:
 *   get:
 *     summary: Obtener configuración del sitio web (admin)
 *     tags: [Website]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración del sitio web
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tenant no encontrado
 */
router.get('/admin', authMiddleware, websiteController.getAdminConfig);

/**
 * @swagger
 * /api/website/home:
 *   patch:
 *     summary: Actualizar configuración de la sección Home
 *     tags: [Website]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hero:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     maxLength: 100
 *                   subtitle:
 *                     type: string
 *                     maxLength: 200
 *                   imageUrl:
 *                     type: string
 *                   ctaText:
 *                     type: string
 *                     maxLength: 50
 *                   ctaLink:
 *                     type: string
 *               features:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   items:
 *                     type: array
 *                     maxItems: 6
 *               carousel:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   autoplay:
 *                     type: boolean
 *                   interval:
 *                     type: number
 *                   images:
 *                     type: array
 *                     maxItems: 10
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 */
router.patch('/home', authMiddleware, websiteController.updateHomeConfig);

/**
 * @swagger
 * /api/website/about:
 *   patch:
 *     summary: Actualizar configuración de la sección About
 *     tags: [Website]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               history:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   title:
 *                     type: string
 *                     maxLength: 100
 *                   content:
 *                     type: string
 *                     maxLength: 2000
 *                   imageUrl:
 *                     type: string
 *               mission:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   title:
 *                     type: string
 *                     maxLength: 100
 *                   content:
 *                     type: string
 *                     maxLength: 2000
 *                   imageUrl:
 *                     type: string
 *               values:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   title:
 *                     type: string
 *                     maxLength: 100
 *                   items:
 *                     type: array
 *                     maxItems: 8
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 */
router.patch('/about', authMiddleware, websiteController.updateAboutConfig);

/**
 * @swagger
 * /api/website/upload:
 *   post:
 *     summary: Subir imagen para el sitio web
 *     tags: [Website]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Imagen en formato base64 (data:image/...)
 *               section:
 *                 type: string
 *                 enum: [home, about, carousel, features, hero, history, mission]
 *                 description: Sección donde se usará la imagen
 *     responses:
 *       200:
 *         description: Imagen subida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     publicId:
 *                       type: string
 *                     width:
 *                       type: number
 *                     height:
 *                       type: number
 *                     format:
 *                       type: string
 *                     size:
 *                       type: number
 *       400:
 *         description: Imagen no proporcionada o formato inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 */
router.post('/upload', authMiddleware, websiteController.uploadImage);

/**
 * @swagger
 * /api/website:
 *   put:
 *     summary: Actualizar configuración completa del sitio web
 *     tags: [Website]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               home:
 *                 type: object
 *               about:
 *                 type: object
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 */
router.put('/', authMiddleware, websiteController.updateFullConfig);

export default router;

