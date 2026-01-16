import { Request, Response } from 'express';
import websiteService from '../services/website.service';
import { updateHomeConfigSchema, updateAboutConfigSchema } from '../validators/website.validator';
import { successResponse, errorResponse } from '../utils/response';
import { v2 as cloudinary } from 'cloudinary';

// Interfaz para request autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    tenantId: string | null;
  };
}

/**
 * @route   GET /api/website
 * @desc    Obtener configuración del sitio web (público)
 * @access  Public
 */
export const getPublicConfig = async (req: Request, res: Response) => {
  try {
    const tenantDomain = req.headers['x-tenant-domain'] as string;

    if (!tenantDomain) {
      return res.status(400).json(
        errorResponse('Se requiere el header X-Tenant-Domain')
      );
    }

    const config = await websiteService.getPublicWebsiteConfig(tenantDomain);

    return res.json(successResponse(config));
  } catch (error: any) {
    console.error('Error obteniendo configuración pública:', error);

    if (error.message === 'Restaurante no encontrado') {
      return res.status(404).json(errorResponse(error.message));
    }

    return res.status(500).json(
      errorResponse('Error al obtener la configuración')
    );
  }
};

/**
 * @route   GET /api/website/admin
 * @desc    Obtener configuración del sitio web (admin)
 * @access  Private (ADMIN)
 */
export const getAdminConfig = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json(
        errorResponse('Tenant no identificado')
      );
    }

    const config = await websiteService.getWebsiteConfig(tenantId);

    return res.json(successResponse(config));
  } catch (error: any) {
    console.error('Error obteniendo configuración admin:', error);

    if (error.message === 'Tenant no encontrado') {
      return res.status(404).json(errorResponse(error.message));
    }

    return res.status(500).json(
      errorResponse('Error al obtener la configuración')
    );
  }
};

/**
 * @route   PATCH /api/website/home
 * @desc    Actualizar configuración de Home
 * @access  Private (ADMIN)
 */
export const updateHomeConfig = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userRole = req.user?.role;

    if (!tenantId) {
      return res.status(400).json(
        errorResponse('Tenant no identificado')
      );
    }

    // Solo ADMIN puede modificar
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return res.status(403).json(
        errorResponse('No tienes permiso para modificar esta configuración')
      );
    }

    // Validar datos
    const validatedData = updateHomeConfigSchema.parse(req.body);

    const updatedConfig = await websiteService.updateHomeConfig(tenantId, validatedData);

    return res.json(
      successResponse(updatedConfig, 'Configuración de Home actualizada correctamente')
    );
  } catch (error: any) {
    console.error('Error actualizando Home:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.errors
      });
    }

    if (error.message === 'Tenant no encontrado') {
      return res.status(404).json(errorResponse(error.message));
    }

    return res.status(500).json(
      errorResponse('Error al actualizar la configuración')
    );
  }
};

/**
 * @route   PATCH /api/website/about
 * @desc    Actualizar configuración de About
 * @access  Private (ADMIN)
 */
export const updateAboutConfig = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userRole = req.user?.role;

    if (!tenantId) {
      return res.status(400).json(
        errorResponse('Tenant no identificado')
      );
    }

    // Solo ADMIN puede modificar
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return res.status(403).json(
        errorResponse('No tienes permiso para modificar esta configuración')
      );
    }

    // Validar datos
    const validatedData = updateAboutConfigSchema.parse(req.body);

    const updatedConfig = await websiteService.updateAboutConfig(tenantId, validatedData);

    return res.json(
      successResponse(updatedConfig, 'Configuración de About actualizada correctamente')
    );
  } catch (error: any) {
    console.error('Error actualizando About:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.errors
      });
    }

    if (error.message === 'Tenant no encontrado') {
      return res.status(404).json(errorResponse(error.message));
    }

    return res.status(500).json(
      errorResponse('Error al actualizar la configuración')
    );
  }
};

/**
 * @route   POST /api/website/upload
 * @desc    Subir imagen para el sitio web
 * @access  Private (ADMIN)
 */
export const uploadImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userRole = req.user?.role;

    if (!tenantId) {
      return res.status(400).json(
        errorResponse('Tenant no identificado')
      );
    }

    // Solo ADMIN puede subir imágenes
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return res.status(403).json(
        errorResponse('No tienes permiso para subir imágenes')
      );
    }

    // Verificar que se envió una imagen
    const { image, section } = req.body;

    if (!image) {
      return res.status(400).json(
        errorResponse('No se ha proporcionado ninguna imagen')
      );
    }

    // Verificar que es un base64 válido
    if (!image.startsWith('data:image/')) {
      return res.status(400).json(
        errorResponse('Formato de imagen no válido. Envía la imagen en base64')
      );
    }

    // Subir a Cloudinary
    const folder = `tenants/${tenantId}/website/${section || 'general'}`;

    const result = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });

    return res.json(
      successResponse({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }, 'Imagen subida correctamente')
    );
  } catch (error: any) {
    console.error('Error subiendo imagen:', error);

    return res.status(500).json(
      errorResponse('Error al subir la imagen')
    );
  }
};

/**
 * @route   PUT /api/website
 * @desc    Actualizar configuración completa del sitio web
 * @access  Private (ADMIN)
 */
export const updateFullConfig = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userRole = req.user?.role;

    if (!tenantId) {
      return res.status(400).json(
        errorResponse('Tenant no identificado')
      );
    }

    // Solo ADMIN puede modificar
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return res.status(403).json(
        errorResponse('No tienes permiso para modificar esta configuración')
      );
    }

    const updatedConfig = await websiteService.updateFullConfig(tenantId, req.body);

    return res.json(
      successResponse(updatedConfig, 'Configuración actualizada correctamente')
    );
  } catch (error: any) {
    console.error('Error actualizando configuración:', error);

    if (error.message === 'Tenant no encontrado') {
      return res.status(404).json(errorResponse(error.message));
    }

    return res.status(500).json(
      errorResponse('Error al actualizar la configuración')
    );
  }
};

export default {
  getPublicConfig,
  getAdminConfig,
  updateHomeConfig,
  updateAboutConfig,
  uploadImage,
  updateFullConfig
};

