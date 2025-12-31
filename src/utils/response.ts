import { Response } from 'express';
import { ApiResponse } from '../types';

export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  error: string,
  statusCode: number = 500,
  additionalData?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    ...additionalData,
  };
  return res.status(statusCode).json(response);
};

