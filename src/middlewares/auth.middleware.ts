import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';
import { errorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: JwtPayload;
  tenant?: {
    id: string;
    name: string;
    domain: string;
    settings: any;
    plan: string;
    status: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ [AUTH] No token provided');
      return res.status(401).json(errorResponse('No token provided'));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;

    // Verificar que el usuario pertenece al tenant de la petición (si aplica)
    const requestTenant = req.tenant;

    // SuperAdmin puede acceder a cualquier tenant
    if (decoded.role !== 'SUPERADMIN' && requestTenant) {
      if (decoded.tenantId !== requestTenant.id) {
        return res.status(403).json(
          errorResponse('No tienes acceso a este restaurante')
        );
      }
    }

    next();
  } catch (error: any) {
    console.log('❌ [AUTH] Error:', error.message);
    return res.status(401).json(errorResponse('Invalid or expired token'));
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Access denied. Admin only.'));
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        errorResponse('Access denied. Insufficient permissions.')
      );
    }

    next();
  };
};
