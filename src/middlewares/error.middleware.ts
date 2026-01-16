import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/helpers';
import { errorResponse } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    // Si es un error de tamaño de imagen, devolver un mensaje más específico
    const imageError = errors.find(e => e.field === 'image' && e.message.includes('demasiado grande'));
    if (imageError) {
      return res.status(413).json({
        success: false,
        error: imageError.message,
        code: 'IMAGE_TOO_LARGE',
        maxSize: '10MB',
        suggestion: 'Intenta comprimir la imagen usando herramientas online como tinypng.com o compressor.io'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      errors: errors
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json(errorResponse('A record with this value already exists'));
  }

  if (err.code === 'P2025') {
    return res.status(404).json(errorResponse('Record not found'));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse('Invalid token'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('Token expired'));
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json(errorResponse(message));
};

export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json(errorResponse(`Route ${req.originalUrl} not found`));
};

