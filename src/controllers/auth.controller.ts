import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { successResponse, errorResponse } from '../utils/response';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);

      return successResponse(res, result, 'User registered successfully', 201);
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return errorResponse(res, error.message, 409);
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      return successResponse(res, result, 'Login successful');
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return errorResponse(res, error.message, 401);
      }
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return errorResponse(res, 'No token provided', 401);
      }

      const user = await authService.verifyToken(token);

      return successResponse(res, { user }, 'Token is valid');
    } catch (error: any) {
      if (error.message === 'User not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }
}

export default new AuthController();

