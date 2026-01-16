import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Extender Request type
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string | null;
  };
}

/**
 * Todas las rutas requieren ADMIN del tenant
 */
router.use(authMiddleware);
router.use(requireRole(['ADMIN']));

/**
 * @route   GET /api/admin/users
 * @desc    Obtener usuarios del tenant
 * @access  ADMIN
 */
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a este recurso',
      });
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId: tenantId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Crear nuevo usuario en el tenant
 * @access  ADMIN
 */
router.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a este recurso',
      });
    }

    const { email, name, password, role } = req.body;

    // Validar campos requeridos
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, nombre y contraseña son requeridos',
      });
    }

    // Validar que el role sea válido (solo ADMIN u ORDERS_MANAGER)
    const validRoles = ['ADMIN', 'ORDERS_MANAGER'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role inválido. Solo se permite ADMIN u ORDERS_MANAGER',
      });
    }

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado',
      });
    }

    // Hash de la contraseña
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'ORDERS_MANAGER', // Default: ORDERS_MANAGER
        tenantId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`✅ Usuario creado: ${newUser.email} (${newUser.role})`);

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'Usuario creado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Actualizar usuario del tenant
 * @access  ADMIN
 */
router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a este recurso',
      });
    }

    const { name, role } = req.body;

    // Verificar que el usuario pertenece al tenant
    const user = await prisma.user.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Validar role si se proporciona
    if (role) {
      const validRoles = ['ADMIN', 'ORDERS_MANAGER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Role inválido. Solo se permite ADMIN u ORDERS_MANAGER',
        });
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Eliminar usuario del tenant
 * @access  ADMIN
 */
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a este recurso',
      });
    }

    // Verificar que el usuario pertenece al tenant
    const user = await prisma.user.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // No permitir eliminar al propio usuario
    if (id === req.user?.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta',
      });
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id },
    });

    console.log(`🗑️ Usuario eliminado: ${user.email}`);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Obtener estadísticas del tenant
 * @access  ADMIN
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a este recurso',
      });
    }

    // Contar platos
    const dishesCount = await prisma.dish.count({
      where: { tenantId },
    });

    // Contar categorías
    const categoriesCount = await prisma.category.count({
      where: { tenantId },
    });

    // Contar órdenes
    const ordersCount = await prisma.order.count({
      where: { tenantId },
    });

    // Contar usuarios
    const usersCount = await prisma.user.count({
      where: { tenantId },
    });

    // Órdenes recientes
    const recentOrders = await prisma.order.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        dishes: dishesCount,
        categories: categoriesCount,
        orders: ordersCount,
        users: usersCount,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

