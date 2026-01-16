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
        tenantId: req.tenant?.id,
      };

      const result = await dishService.getAll(filters);
      return res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      const dish = await dishService.getById(id, tenantId);
      return res.json(successResponse(dish));
    } catch (error: any) {
      if (error.message === 'Dish not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json(errorResponse('Tenant ID is required'));
      }

      const dish = await dishService.getBySlug(slug, tenantId);
      return res.json(successResponse(dish));
    } catch (error: any) {
      if (error.message === 'Dish not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json(errorResponse('Tenant ID is required'));
      }

      const validatedData = createDishSchema.parse(req.body);
      const dish = await dishService.create(validatedData, tenantId);
      return res.status(201).json(successResponse(dish, 'Dish created successfully'));
    } catch (error: any) {
      if (error.message === 'Dish with this name already exists') {
        return res.status(409).json(errorResponse(error.message));
      }
      if (error.message === 'Category not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      const validatedData = updateDishSchema.parse(req.body);
      const dish = await dishService.update(id, validatedData, tenantId);
      return res.json(successResponse(dish, 'Dish updated successfully'));
    } catch (error: any) {
      if (error.message === 'Dish not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      const result = await dishService.delete(id, tenantId);
      return res.json(successResponse(result, 'Dish deleted successfully'));
    } catch (error: any) {
      if (error.message === 'Dish not found') {
        return res.status(404).json(errorResponse(error.message));
      }
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { dishIds } = req.body;

      if (!Array.isArray(dishIds)) {
        return res.status(400).json(errorResponse('dishIds must be an array'));
      }

      const result = await dishService.reorder(dishIds);
      return res.json(successResponse(result, 'Dishes reordered successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export default new DishController();

