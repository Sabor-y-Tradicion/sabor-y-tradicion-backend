# 💻 Ejemplos de Código Frontend - Integración con Backend
## Sabor y Tradición

---

## 📁 Estructura de Archivos a Crear en Frontend

```
frontend/
├── lib/
│   └── api/
│       ├── client.ts       # Cliente axios configurado
│       ├── auth.ts         # API de autenticación
│       ├── categories.ts   # API de categorías
│       └── dishes.ts       # API de platos
├── contexts/
│   └── AuthContext.tsx     # Context de autenticación
├── hooks/
│   ├── useAuth.ts          # Hook de autenticación
│   ├── useCategories.ts    # Hook de categorías
│   └── useDishes.ts        # Hook de platos
└── .env.local              # Variables de entorno
```

---

## 🔧 1. Configuración Inicial

### `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

---

## 🌐 2. Cliente Axios Base

### `lib/api/client.ts`
```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🔐 3. API de Autenticación

### `lib/api/auth.ts`
```typescript
import { apiClient } from './client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
  role?: 'ADMIN' | 'EDITOR';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  verify: async (): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },
};
```

---

## 📂 4. API de Categorías

### `lib/api/categories.ts`
```typescript
import { apiClient } from './client';

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

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export const categoriesAPI = {
  getAll: async (): Promise<{ success: boolean; data: Category[] }> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Category }> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<{ success: boolean; data: Category }> => {
    const response = await apiClient.get(`/categories/slug/${slug}`);
    return response.data;
  },

  create: async (data: CreateCategoryData): Promise<{ success: boolean; data: Category }> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateCategoryData
  ): Promise<{ success: boolean; data: Category }> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  reorder: async (categoryIds: string[]): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/categories/reorder', { categoryIds });
    return response.data;
  },
};
```

---

## 🍽️ 5. API de Platos

### `lib/api/dishes.ts`
```typescript
import { apiClient } from './client';

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

export interface CreateDishData {
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

export interface UpdateDishData extends Partial<CreateDishData> {}

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

export interface PaginatedDishesResponse {
  success: boolean;
  data: Dish[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const dishesAPI = {
  getAll: async (filters?: DishFilters): Promise<PaginatedDishesResponse> => {
    const response = await apiClient.get('/dishes', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Dish }> => {
    const response = await apiClient.get(`/dishes/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<{ success: boolean; data: Dish }> => {
    const response = await apiClient.get(`/dishes/slug/${slug}`);
    return response.data;
  },

  create: async (data: CreateDishData): Promise<{ success: boolean; data: Dish }> => {
    const response = await apiClient.post('/dishes', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDishData): Promise<{ success: boolean; data: Dish }> => {
    const response = await apiClient.put(`/dishes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/dishes/${id}`);
    return response.data;
  },

  reorder: async (dishIds: string[]): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/dishes/reorder', { dishIds });
    return response.data;
  },
};
```

---

## 🔐 6. Context de Autenticación

### `contexts/AuthContext.tsx`
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, User, LoginData } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar token al cargar la app
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      authAPI
        .verify()
        .then((response) => {
          setUser(response.data);
          setToken(savedToken);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data);
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      router.push('/admin/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## 🎣 7. Custom Hooks

### `hooks/useCategories.ts`
```typescript
import { useState, useEffect } from 'react';
import { categoriesAPI, Category } from '@/lib/api/categories';
import { toast } from 'sonner';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (data: any) => {
    try {
      const response = await categoriesAPI.create(data);
      setCategories([...categories, response.data]);
      toast.success('Categoría creada exitosamente');
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear categoría');
      throw err;
    }
  };

  const updateCategory = async (id: string, data: any) => {
    try {
      const response = await categoriesAPI.update(id, data);
      setCategories(categories.map((cat) => (cat.id === id ? response.data : cat)));
      toast.success('Categoría actualizada exitosamente');
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al actualizar categoría');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesAPI.delete(id);
      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success('Categoría eliminada exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al eliminar categoría');
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
  };
};
```

### `hooks/useDishes.ts`
```typescript
import { useState, useEffect } from 'react';
import { dishesAPI, Dish, DishFilters } from '@/lib/api/dishes';
import { toast } from 'sonner';

export const useDishes = (initialFilters?: DishFilters) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<DishFilters>(initialFilters || {});

  const fetchDishes = async (newFilters?: DishFilters) => {
    try {
      setIsLoading(true);
      const appliedFilters = newFilters || filters;
      const response = await dishesAPI.getAll(appliedFilters);
      setDishes(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al cargar platos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, [filters]);

  const createDish = async (data: any) => {
    try {
      const response = await dishesAPI.create(data);
      toast.success('Plato creado exitosamente');
      fetchDishes(); // Refrescar lista
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear plato');
      throw err;
    }
  };

  const updateDish = async (id: string, data: any) => {
    try {
      const response = await dishesAPI.update(id, data);
      toast.success('Plato actualizado exitosamente');
      fetchDishes(); // Refrescar lista
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al actualizar plato');
      throw err;
    }
  };

  const deleteDish = async (id: string) => {
    try {
      await dishesAPI.delete(id);
      toast.success('Plato eliminado exitosamente');
      fetchDishes(); // Refrescar lista
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al eliminar plato');
      throw err;
    }
  };

  return {
    dishes,
    isLoading,
    error,
    pagination,
    filters,
    setFilters,
    refetch: fetchDishes,
    createDish,
    updateDish,
    deleteDish,
  };
};
```

---

## 🔒 8. Protección de Rutas

### `app/admin/layout.tsx`
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

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

## 📄 9. Ejemplo de Página de Login

### `app/admin/login/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
      toast.success('¡Bienvenido!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
        </Button>
        
        <p className="text-sm text-center text-gray-600">
          Usa: admin@sabor-tradicion.com / admin123
        </p>
      </form>
    </div>
  );
}
```

---

## 📄 10. Ejemplo de Página de Categorías

### `app/admin/categories/page.tsx`
```typescript
'use client';

import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function CategoriesPage() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return <div>Cargando categorías...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
                <p className="text-xs text-gray-400">
                  {category._count?.dishes || 0} platos
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
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

## 🎉 ¡Listo para Integrar!

Con estos archivos, tu frontend estará completamente conectado con el backend.

### Pasos finales:
1. Copiar estos archivos a tu proyecto frontend
2. Instalar dependencias: `npm install axios`
3. Configurar `.env.local`
4. Iniciar ambos servidores:
   - Backend: `npm run dev` (puerto 5000)
   - Frontend: `npm run dev` (puerto 3000)
5. Visitar `http://localhost:3000/admin/login`

**¡Disfruta de tu aplicación fullstack! 🚀**

