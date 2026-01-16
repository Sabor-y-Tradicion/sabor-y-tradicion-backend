export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JwtPayload {
  userId: string;
  id: string; // Alias de userId para compatibilidad
  email: string;
  role: string;
  tenantId: string | null;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

