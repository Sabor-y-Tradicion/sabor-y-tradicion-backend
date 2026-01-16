import { Request, Response } from 'express';
import logsService from '../services/logs.service';
import { successResponse, errorResponse } from '../utils/response';
import { LogLevel, LogAction } from '@prisma/client';

export class LogsController {
  /**
   * Obtener todos los logs con filtros
   * GET /api/logs
   */
  async findAll(req: Request, res: Response) {
    try {
      const {
        level,
        action,
        userId,
        tenantId,
        startDate,
        endDate,
        limit,
        offset,
      } = req.query;

      const filters: any = {};

      if (level) filters.level = level as LogLevel;
      if (action) filters.action = action as LogAction;
      if (userId) filters.userId = userId as string;
      if (tenantId) filters.tenantId = tenantId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const result = await logsService.findAll(filters);

      return res.json(
        successResponse(result, 'Logs obtenidos exitosamente')
      );
    } catch (error: any) {
      console.error('Error al obtener logs:', error);
      return res
        .status(500)
        .json(errorResponse('Error al obtener los logs'));
    }
  }

  /**
   * Obtener estadísticas de logs
   * GET /api/logs/stats
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await logsService.getStats();

      return res.json(
        successResponse(stats, 'Estadísticas obtenidas exitosamente')
      );
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      return res
        .status(500)
        .json(errorResponse('Error al obtener estadísticas'));
    }
  }

  /**
   * Obtener logs por acción específica
   * GET /api/logs/action/:action
   */
  async getByAction(req: Request, res: Response) {
    try {
      const { action } = req.params;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : 10;

      const logs = await logsService.getByAction(action as LogAction, limit);

      return res.json(
        successResponse(logs, `Logs de acción ${action} obtenidos`)
      );
    } catch (error: any) {
      console.error('Error al obtener logs por acción:', error);
      return res
        .status(500)
        .json(errorResponse('Error al obtener los logs'));
    }
  }

  /**
   * Obtener logs recientes (últimas 24h)
   * GET /api/logs/recent
   */
  async getRecent(req: Request, res: Response) {
    try {
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : 50;

      const logs = await logsService.getRecent(limit);

      return res.json(
        successResponse(logs, 'Logs recientes obtenidos exitosamente')
      );
    } catch (error: any) {
      console.error('Error al obtener logs recientes:', error);
      return res
        .status(500)
        .json(errorResponse('Error al obtener los logs'));
    }
  }
}

export default new LogsController();

