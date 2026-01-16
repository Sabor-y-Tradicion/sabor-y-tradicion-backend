import { Response } from 'express';
import subtagService from '../services/subtag.service';
import { createSubtagSchema, updateSubtagSchema } from '../validators/subtag.validator';
import { successResponse, errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/tenant-isolation.middleware';

export class SubtagController {
  /**
   * @route   GET /api/subtags
   * @desc    Obtener todos los subtags del tenant
   * @access  Private (ADMIN, SUPERADMIN)
   */
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json(errorResponse('Tenant no identificado'));
      }

      const subtags = await subtagService.findAll(tenantId);

      return res.json(successResponse(subtags));
    } catch (error: any) {
      console.error('Error al obtener subtags:', error);
      return res.status(500).json(errorResponse('Error al obtener subtags'));
    }
  }

  /**
   * @route   GET /api/subtags/:id
   * @desc    Obtener un subtag por ID
   * @access  Private (ADMIN, SUPERADMIN)
   */
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json(errorResponse('Tenant no identificado'));
      }

      const subtag = await subtagService.findById(id, tenantId);

      return res.json(successResponse(subtag));
    } catch (error: any) {
      console.error('Error al obtener subtag:', error);

      if (error.message === 'Subtag no encontrado') {
        return res.status(404).json(errorResponse(error.message));
      }

      return res.status(500).json(errorResponse('Error al obtener subtag'));
    }
  }

  /**
   * @route   POST /api/subtags
   * @desc    Crear un nuevo subtag
   * @access  Private (ADMIN, SUPERADMIN)
   */
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json(errorResponse('Tenant no identificado'));
      }

      // Validar datos
      const validatedData = createSubtagSchema.parse(req.body);

      // Crear subtag
      const subtag = await subtagService.create(validatedData, tenantId);

      return res.status(201).json(successResponse(subtag, 'Subtag creado exitosamente'));
    } catch (error: any) {
      console.error('Error al crear subtag:', error);

      // Error de validación de Zod
      if (error.name === 'ZodError') {
        return res.status(400).json(
          errorResponse('Datos inválidos', error.errors)
        );
      }

      // Error de subtag duplicado
      if (error.message === 'Ya existe un subtag con ese nombre') {
        return res.status(400).json(errorResponse(error.message));
      }

      return res.status(500).json(errorResponse('Error al crear subtag'));
    }
  }

  /**
   * @route   PATCH /api/subtags/:id
   * @desc    Actualizar un subtag
   * @access  Private (ADMIN, SUPERADMIN)
   */
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json(errorResponse('Tenant no identificado'));
      }

      // Validar datos
      const validatedData = updateSubtagSchema.parse(req.body);

      // Actualizar subtag
      const subtag = await subtagService.update(id, validatedData, tenantId);

      return res.json(successResponse(subtag, 'Subtag actualizado exitosamente'));
    } catch (error: any) {
      console.error('Error al actualizar subtag:', error);

      // Error de validación de Zod
      if (error.name === 'ZodError') {
        return res.status(400).json(
          errorResponse('Datos inválidos', error.errors)
        );
      }

      // Error de subtag no encontrado
      if (error.message === 'Subtag no encontrado') {
        return res.status(404).json(errorResponse(error.message));
      }

      // Error de subtag duplicado
      if (error.message === 'Ya existe un subtag con ese nombre') {
        return res.status(400).json(errorResponse(error.message));
      }

      return res.status(500).json(errorResponse('Error al actualizar subtag'));
    }
  }

  /**
   * @route   DELETE /api/subtags/:id
   * @desc    Eliminar un subtag
   * @access  Private (ADMIN, SUPERADMIN)
   */
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json(errorResponse('Tenant no identificado'));
      }

      const result = await subtagService.delete(id, tenantId);

      return res.json(successResponse(null, result.message));
    } catch (error: any) {
      console.error('Error al eliminar subtag:', error);

      if (error.message === 'Subtag no encontrado') {
        return res.status(404).json(errorResponse(error.message));
      }

      return res.status(500).json(errorResponse('Error al eliminar subtag'));
    }
  }
}

export default new SubtagController();

