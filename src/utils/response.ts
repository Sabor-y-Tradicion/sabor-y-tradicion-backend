import { Response } from 'express';
import { ApiResponse } from '../types';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const successResponse = <T>(
  data: T,
  message?: string,
  pagination?: PaginationInfo
): ApiResponse<T> => {
  const response: any = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

export const errorResponse = (
  error: string,
  additionalData?: any
): ApiResponse => {
  const response: ApiResponse = {
    success: false,
    error,
    ...additionalData,
  };
  return response;
};

// Versiones legacy para compatibilidad con código existente
export const successResponseLegacy = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response = successResponse(data, message);
  return res.status(statusCode).json(response);
};

export const errorResponseLegacy = (
  res: Response,
  error: string,
  statusCode: number = 500,
  additionalData?: any
): Response => {
  const response = errorResponse(error, additionalData);
  return res.status(statusCode).json(response);
};

