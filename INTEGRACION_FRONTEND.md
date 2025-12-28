# 🔌 PLAN DE INTEGRACIÓN FRONTEND-BACKEND
## Sabor y Tradición - Guía Completa de Implementación

---

## 📋 ÍNDICE
1. [Preparación Inicial](#preparación-inicial)
2. [Instalación de Dependencias](#instalación-de-dependencias)
3. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
4. [Estructura de Archivos a Crear](#estructura-de-archivos-a-crear)
5. [Implementación Paso a Paso](#implementación-paso-a-paso)
6. [Testing y Validación](#testing-y-validación)

---

## 🎯 PREPARACIÓN INICIAL

### Estado Actual
- ✅ Backend corriendo en `http://localhost:5000`
- ✅ API REST completamente funcional
- ✅ Endpoints documentados en `/docs`
- ⏭️ Frontend con datos mock que necesita conectarse al backend

### Objetivo
Conectar el frontend Next.js con el backend Express para tener una aplicación fullstack completamente funcional.

---

## 📦 INSTALACIÓN DE DEPENDENCIAS

### 1. Navegar al proyecto frontend
```bash
cd "C:\Users\james\OneDrive\Documentos\Proyecto\Sabor y Tradición\sabor-y-tradicion-frontend"
```

### 2. Instalar paquetes necesarios
```bash
npm install axios
npm install zustand  # Para gestión de estado global (opcional pero recomendado)
npm install react-query @tanstack/react-query  # Para cache y sincronización (opcional)
```

**Nota:** Si prefieres no usar librerías adicionales, axios es suficiente.

---

## 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO

### Crear archivo `.env.local` en la raíz del frontend

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Frontend URL (para CORS)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Configuración de desarrollo
NODE_ENV=development
```

**Importante:** Las variables con `NEXT_PUBLIC_` son accesibles en el cliente.

---

## 📁 ESTRUCTURA DE ARCHIVOS A CREAR

```
frontend/
├── lib/
│   ├── api/
│   │   ├── client.ts           # Cliente axios configurado
│   │   ├── auth.ts             # API de autenticación
│   │   ├── categories.ts       # API de categorías
│   │   ├── dishes.ts           # API de platos
│   │   └── types.ts            # Tipos TypeScript compartidos
│   └── utils/
│       └── storage.ts          # Helper para localStorage
├── contexts/
│   └── AuthContext.tsx         # Context de autenticación global
├── hooks/
│   ├── useAuth.ts              # Hook de autenticación
│   ├── useCategories.ts        # Hook de categorías
│   └── useDishes.ts            # Hook de platos
└── app/
    └── admin/
        ├── layout.tsx          # Layout protegido
        └── login/
            └── page.tsx        # Página de login
```

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

### PASO 1: Tipos TypeScript Compartidos

#### `lib/api/types.ts`
```typescript
// Tipos de respuesta de la API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos de Usuario
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
  createdAt: string;
}

// Tipos de Autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'EDITOR';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Tipos de Categoría
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    dishes: number;
  };
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

// Tipos de Plato
export interface Dish {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  isFeatured: boolean;
  allergens: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDishInput {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isActive?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  isFeatured?: boolean;
  allergens?: string[];
  order?: number;
}

export interface UpdateDishInput extends Partial<CreateDishInput> {}

export interface DishFilters {
  categoryId?: string;
  search?: string;
  isActive?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}
```

---

### PASO 2: Cliente Axios Base

#### `lib/api/client.ts`
```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor de Request - Agregar token automáticamente
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejo de errores global
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ success: boolean; error: string }>) => {
    // Manejo de errores comunes
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Error desconocido';

      switch (status) {
        case 401:
          // Token inválido o expirado
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          
          // Redirigir al login solo si no estamos ya ahí
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/admin/login';
          }
          break;
          
        case 403:
          toast.error('No tienes permisos para realizar esta acción.');
          break;
          
        case 404:
          toast.error('Recurso no encontrado.');
          break;
          
        case 409:
          toast.error(errorMessage || 'Ya existe un registro con estos datos.');
          break;
          
        case 422:
          toast.error(errorMessage || 'Error de validación.');
          break;
          
        case 429:
          toast.error('Demasiadas peticiones. Intenta de nuevo más tarde.');
          break;
          
        case 500:
          toast.error('Error del servidor. Intenta de nuevo más tarde.');
          break;
          
        default:
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Request hecho pero sin respuesta
      toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      // Error al configurar el request
      toast.error('Error al realizar la petición.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### PASO 3: API de Autenticación

#### `lib/api/auth.ts`
```typescript
import apiClient from './client';
import { 
  ApiResponse, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User 
} from './types';

export const authAPI = {
  /**
   * Iniciar sesión
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    
    if (response.data.success && response.data.data) {
      // Guardar token y usuario en localStorage
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
      
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Error al iniciar sesión');
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    
    if (response.data.success && response.data.data) {
      // Guardar token y usuario en localStorage
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
      
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Error al registrar usuario');
  },

  /**
   * Verificar token actual
   */
  verify: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/verify');
    
    if (response.data.success && response.data.data) {
      // Actualizar usuario en localStorage
      localStorage.setItem('auth_user', JSON.stringify(response.data.data));
      
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Error al verificar token');
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  /**
   * Obtener usuario actual del localStorage
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};

export default authAPI;
```

---

### PASO 4: API de Categorías

#### `lib/api/categories.ts`
```typescript
import apiClient from './client';
import {
  ApiResponse,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './types';

export const categoriesAPI = {
  /**
   * Obtener todas las categorías
   */
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  },

  /**
   * Obtener categoría por ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Categoría no encontrada');
  },

  /**
   * Obtener categoría por slug
   */
  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Categoría no encontrada');
  },

  /**
   * Crear nueva categoría
   */
  create: async (data: CreateCategoryInput): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Error al crear categoría');
  },

  /**
   * Actualizar categoría
   */
  update: async (id: string, data: UpdateCategoryInput): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(
      `/categories/${id}`,
      data
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Error al actualizar categoría');
  },

  /**
   * Eliminar categoría
   */
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse>(`/categories/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al eliminar categoría');
    }
  },

  /**
   * Reordenar categorías
   */
  reorder: async (categoryIds: string[]): Promise<void> => {
    const response = await apiClient.post<ApiResponse>('/categories/reorder', {
      categoryIds,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al reordenar categorías');
    }
  },
};

export default categoriesAPI;
```

---

### PASO 5: API de Platos

#### `lib/api/dishes.ts`
```typescript
import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  Dish,
  CreateDishInput,
  UpdateDishInput,
  DishFilters,
} from './types';

export const dishesAPI = {
  /**
   * Obtener todos los platos con filtros
   */
  getAll: async (filters?: DishFilters): Promise<PaginatedResponse<Dish>> => {
    const response = await apiClient.get<PaginatedResponse<Dish>>('/dishes', {
      params: filters,
    });
    
    return response.data;
  },

  /**
   * Obtener plato por ID
   */
  getById: async (id: string): Promise<Dish> => {
    const response = await apiClient.get<ApiResponse<Dish>>(`/dishes/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Plato no encontrado');
  },

  /**
   * Obtener plato por slug
   */
  getBySlug: async (slug: string): Promise<Dish> => {
    const response = await apiClient.get<ApiResponse<Dish>>(`/dishes/slug/${slug}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Plato no encontrado');
  },

  /**
   * Crear nuevo plato
   */
  create: async (data: CreateDishInput): Promise<Dish> => {
    const response = await apiClient.post<ApiResponse<Dish>>('/dishes', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Error al crear plato');
  },

  /**
   * Actualizar plato
   */
  update: async (id: string, data: UpdateDishInput): Promise<Dish> => {
    const response = await apiClient.put<ApiResponse<Dish>>(`/dishes/${id}`, data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Error al actualizar plato');
  },

  /**
   * Eliminar plato
   */
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse>(`/dishes/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al eliminar plato');
    }
  },

  /**
   * Reordenar platos
   */
  reorder: async (dishIds: string[]): Promise<void> => {
    const response = await apiClient.post<ApiResponse>('/dishes/reorder', {
      dishIds,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al reordenar platos');
    }
  },
};

export default dishesAPI;
```

---

### PASO 6: Context de Autenticación

#### `contexts/AuthContext.tsx`
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';
import { User, LoginCredentials } from '@/lib/api/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const userData = await authAPI.verify();
        setUser(userData);
      }
    } catch (error) {
      // Si falla la verificación, limpiar datos
      authAPI.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const authData = await authAPI.login(credentials);
      setUser(authData.user);
      toast.success(`¡Bienvenido, ${authData.user.name}!`);
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    toast.info('Sesión cerrada exitosamente');
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

### PASO 7: Custom Hooks

#### `hooks/useCategories.ts`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { categoriesAPI } from '@/lib/api/categories';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/lib/api/types';
import { toast } from 'sonner';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías al montar
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar categorías';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (data: CreateCategoryInput): Promise<Category> => {
    try {
      const newCategory = await categoriesAPI.create(data);
      setCategories([...categories, newCategory]);
      toast.success('Categoría creada exitosamente');
      return newCategory;
    } catch (err: any) {
      toast.error(err.message || 'Error al crear categoría');
      throw err;
    }
  };

  const updateCategory = async (
    id: string,
    data: UpdateCategoryInput
  ): Promise<Category> => {
    try {
      const updatedCategory = await categoriesAPI.update(id, data);
      setCategories(
        categories.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      toast.success('Categoría actualizada exitosamente');
      return updatedCategory;
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar categoría');
      throw err;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await categoriesAPI.delete(id);
      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success('Categoría eliminada exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar categoría');
      throw err;
    }
  };

  const reorderCategories = async (categoryIds: string[]): Promise<void> => {
    try {
      await categoriesAPI.reorder(categoryIds);
      // Reordenar localmente
      const reordered = categoryIds.map(id => 
        categories.find(cat => cat.id === id)!
      ).filter(Boolean);
      setCategories(reordered);
      toast.success('Categorías reordenadas exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al reordenar categorías');
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
};
```

#### `hooks/useDishes.ts`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { dishesAPI } from '@/lib/api/dishes';
import { 
  Dish, 
  CreateDishInput, 
  UpdateDishInput, 
  DishFilters 
} from '@/lib/api/types';
import { toast } from 'sonner';

export const useDishes = (initialFilters?: DishFilters) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DishFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Cargar platos cuando cambien los filtros
  useEffect(() => {
    fetchDishes();
  }, [filters]);

  const fetchDishes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dishesAPI.getAll(filters);
      setDishes(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar platos';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const createDish = async (data: CreateDishInput): Promise<Dish> => {
    try {
      const newDish = await dishesAPI.create(data);
      toast.success('Plato creado exitosamente');
      await fetchDishes(); // Recargar lista
      return newDish;
    } catch (err: any) {
      toast.error(err.message || 'Error al crear plato');
      throw err;
    }
  };

  const updateDish = async (id: string, data: UpdateDishInput): Promise<Dish> => {
    try {
      const updatedDish = await dishesAPI.update(id, data);
      toast.success('Plato actualizado exitosamente');
      await fetchDishes(); // Recargar lista
      return updatedDish;
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar plato');
      throw err;
    }
  };

  const deleteDish = async (id: string): Promise<void> => {
    try {
      await dishesAPI.delete(id);
      setDishes(dishes.filter((dish) => dish.id !== id));
      toast.success('Plato eliminado exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar plato');
      throw err;
    }
  };

  const changePage = (page: number) => {
    setFilters({ ...filters, page });
  };

  return {
    dishes,
    isLoading,
    error,
    pagination,
    filters,
    setFilters,
    changePage,
    refetch: fetchDishes,
    createDish,
    updateDish,
    deleteDish,
  };
};
```

---

### PASO 8: Actualizar Layout Admin

#### `app/admin/layout.tsx`
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si no está autenticado y no está en login, redirigir
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Mostrar loader mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si está en login, mostrar sin verificar auth
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Si no está autenticado, no mostrar nada (redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
```

---

### PASO 9: Página de Login

#### `app/admin/login/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@sabor-tradicion.com');
  const [password, setPassword] = useState('admin123');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
    } catch (error) {
      // El error ya se maneja en el context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Panel de Administración
          </CardTitle>
          <CardDescription className="text-center">
            Sabor y Tradición
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sabor-tradicion.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>

            <div className="text-sm text-center text-muted-foreground mt-4">
              <p>Credenciales de prueba:</p>
              <p className="font-mono text-xs mt-1">
                admin@sabor-tradicion.com / admin123
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ✅ PASO 10: Actualizar Páginas Existentes

### Ejemplo: `app/admin/categories/page.tsx`

**ANTES (con datos mock):**
```typescript
const [categories, setCategories] = useState(mockCategories);
```

**DESPUÉS (con API real):**
```typescript
'use client';

import { useCategories } from '@/hooks/useCategories';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CategoriesPage() {
  const { 
    categories, 
    isLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategories();

  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {category._count?.dishes || 0} platos
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Abrir modal de edición */}}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteCategory(category.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 TESTING Y VALIDACIÓN

### Checklist de Pruebas

#### Autenticación ✅
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas
- [ ] Redirección automática al login si no hay token
- [ ] Logout y limpieza de datos
- [ ] Persistencia de sesión al recargar página

#### Categorías ✅
- [ ] Listar todas las categorías
- [ ] Crear nueva categoría
- [ ] Editar categoría existente
- [ ] Eliminar categoría
- [ ] Ver contador de platos por categoría

#### Platos ✅
- [ ] Listar platos con paginación
- [ ] Filtrar por categoría
- [ ] Buscar por nombre
- [ ] Crear nuevo plato
- [ ] Editar plato existente
- [ ] Eliminar plato
- [ ] Cambiar estado activo/inactivo

#### Manejo de Errores ✅
- [ ] Mensaje de error en conexión fallida
- [ ] Validación de formularios
- [ ] Token expirado redirige a login
- [ ] Mensajes toast informativos

---

## 📝 COMANDOS FINALES

### 1. Asegúrate de que el backend esté corriendo
```bash
cd "C:\Users\james\OneDrive\Documentos\Proyecto\Sabor y Tradición\sabor-y-tradicion-backend"
npm run dev
```

### 2. Inicia el frontend
```bash
cd "C:\Users\james\OneDrive\Documentos\Proyecto\Sabor y Tradición\sabor-y-tradicion-frontend"
npm run dev
```

### 3. Abre el navegador
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Documentación: http://localhost:5000/docs

---

## 🎯 RESUMEN DE IMPLEMENTACIÓN

### Lo que has logrado:
1. ✅ Cliente axios configurado con interceptores
2. ✅ APIs completas para auth, categorías y platos
3. ✅ Context de autenticación global
4. ✅ Custom hooks reutilizables
5. ✅ Protección de rutas admin
6. ✅ Manejo de errores centralizado
7. ✅ Página de login funcional
8. ✅ TypeScript types completos

### Próximos pasos opcionales:
- Agregar React Query para mejor cache
- Implementar upload de imágenes
- Agregar skeleton loaders
- Implementar optimistic updates
- Agregar tests unitarios

---

**¡Tu aplicación fullstack está lista! 🎉**

Ahora tienes:
- ✅ Backend API funcionando
- ✅ Frontend conectado al backend
- ✅ Autenticación completa
- ✅ CRUD de categorías y platos
- ✅ Manejo de errores robusto

