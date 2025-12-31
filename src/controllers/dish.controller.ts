import { Request, Response, NextFunction } from 'express';
import dishService from '../services/dish.service';
import { createDishSchema, updateDishSchema } from '../validators/dish.validator';
import { successResponse, errorResponse } from '../utils/response';

export class DishController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        categoryId: req.query.categoryId as string,
        search: req.query.search as string,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        isFeatured: req.query.isFeatured === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await dishService.getAll(filters);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dish = await dishService.getById(id);
      return successResponse(res, dish);
    } catch (error: any) {
      if (error.message === 'Dish not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const dish = await dishService.getBySlug(slug);
      return successResponse(res, dish);
    } catch (error: any) {
      if (error.message === 'Dish not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createDishSchema.parse(req.body);
      const dish = await dishService.create(validatedData);
      return successResponse(res, dish, 'Dish created successfully', 201);
    } catch (error: any) {
      if (error.message === 'Dish with this name already exists') {
        return errorResponse(res, error.message, 409);
      }
      if (error.message === 'Category not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateDishSchema.parse(req.body);
      const dish = await dishService.update(id, validatedData);
      return successResponse(res, dish, 'Dish updated successfully');
    } catch (error: any) {
      if (error.message === 'Dish not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await dishService.delete(id);
      return successResponse(res, result, 'Dish deleted successfully');
    } catch (error: any) {
      if (error.message === 'Dish not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { dishIds } = req.body;

      if (!Array.isArray(dishIds)) {
        return errorResponse(res, 'dishIds must be an array', 400);
      }

      const result = await dishService.reorder(dishIds);
      return successResponse(res, result, 'Dishes reordered successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new DishController();

