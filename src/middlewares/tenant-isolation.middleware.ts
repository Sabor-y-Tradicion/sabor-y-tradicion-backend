import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string | null;
  };
}

export const tenantIsolationGuard = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const tenant = req.tenant;

  // SUPERADMIN puede acceder a cualquier tenant
  if (user?.role === 'SUPERADMIN') {
    return next();
  }

  // Verificar que el usuario pertenezca al tenant actual
  if (!user || !tenant) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Debe estar autenticado para acceder a este recurso',
    });
  }

  // Usuarios normales solo pueden acceder a su tenant
  if (user.tenantId !== tenant.id) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'No tienes acceso a este tenant',
    });
  }

  next();
};

