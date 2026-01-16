import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/database';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);

      return res.status(201).json(successResponse(result, 'User registered successfully'));
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return res.status(409).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      return res.json(successResponse(result, 'Login successful'));
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json(errorResponse('No token provided'));
      }

      const user = await authService.verifyToken(token);

      return res.json(successResponse({ user }, 'Token is valid'));
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json(errorResponse('No authenticated user'));
      }

      // Obtener datos completos del usuario
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              domain: true,
              plan: true,
              status: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json(errorResponse('User not found'));
      }

      return res.json(successResponse(user));
    } catch (error: any) {
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    // Con JWT stateless, el logout es del lado del cliente
    // Solo retornamos success
    return res.json(successResponse(null, 'Logout successful'));
  }
}

export default new AuthController();

