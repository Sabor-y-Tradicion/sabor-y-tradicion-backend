import { PrismaClient } from '@prisma/client';
import { CreateSubtagInput, UpdateSubtagInput } from '../validators/subtag.validator';

const prisma = new PrismaClient();

export class SubtagService {
  /**
   * Obtener todos los subtags de un tenant
   */
  async findAll(tenantId: string) {
    const subtags = await prisma.subtag.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    return subtags;
  }

  /**
   * Obtener un subtag por ID
   */
  async findById(id: string, tenantId: string) {
    const subtag = await prisma.subtag.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!subtag) {
      throw new Error('Subtag no encontrado');
    }

    return subtag;
  }

  /**
   * Crear un nuevo subtag
   */
  async create(data: CreateSubtagInput, tenantId: string) {
    const trimmedName = data.name.trim();

    // Verificar si ya existe un subtag con ese nombre (case-insensitive)
    const existing = await prisma.subtag.findFirst({
      where: {
        tenantId,
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new Error('Ya existe un subtag con ese nombre');
    }

    // Crear el subtag
    const subtag = await prisma.subtag.create({
      data: {
        name: trimmedName,
        tenantId,
      },
    });

    return subtag;
  }

  /**
   * Actualizar un subtag
   */
  async update(id: string, data: UpdateSubtagInput, tenantId: string) {
    // Verificar que el subtag existe y pertenece al tenant
    const subtag = await prisma.subtag.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!subtag) {
      throw new Error('Subtag no encontrado');
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (data.name) {
      const trimmedName = data.name.trim();

      const existing = await prisma.subtag.findFirst({
        where: {
          tenantId,
          name: {
            equals: trimmedName,
            mode: 'insensitive',
          },
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new Error('Ya existe un subtag con ese nombre');
      }

      // Actualizar
      const updated = await prisma.subtag.update({
        where: { id },
        data: {
          name: trimmedName,
        },
      });

      return updated;
    }

    return subtag;
  }

  /**
   * Eliminar un subtag
   */
  async delete(id: string, tenantId: string) {
    // Verificar que el subtag existe y pertenece al tenant
    const subtag = await prisma.subtag.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!subtag) {
      throw new Error('Subtag no encontrado');
    }

    // Remover el subtag de todos los platos que lo tienen
    const dishes = await prisma.dish.findMany({
      where: {
        tenantId,
        subtagIds: {
          has: id,
        },
      },
    });

    // Actualizar cada plato para remover el subtagId
    for (const dish of dishes) {
      const newSubtagIds = dish.subtagIds.filter((subtagId) => subtagId !== id);
      await prisma.dish.update({
        where: { id: dish.id },
        data: { subtagIds: newSubtagIds },
      });
    }

    // Eliminar el subtag
    await prisma.subtag.delete({
      where: { id },
    });

    return { message: 'Subtag eliminado correctamente' };
  }

  /**
   * Obtener subtags por IDs (útil para poblar datos en dishes)
   */
  async findByIds(ids: string[], tenantId: string) {
    if (!ids || ids.length === 0) return [];

    const subtags = await prisma.subtag.findMany({
      where: {
        id: {
          in: ids,
        },
        tenantId,
      },
    });

    return subtags;
  }
}

export default new SubtagService();

