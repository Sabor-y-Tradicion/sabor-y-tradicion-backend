import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sabor y Tradición API',
      version: '1.0.0',
      description: 'API REST para el sistema de gestión de menú del restaurante Sabor y Tradición',
      contact: {
        name: 'Sabor y Tradición',
        email: 'contacto@sabor-tradicion.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'EDITOR'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string', nullable: true },
            icon: { type: 'string', nullable: true },
            order: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            _count: {
              type: 'object',
              properties: {
                dishes: { type: 'integer' },
              },
            },
          },
        },
        Dish: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'decimal' },
            imageUrl: { type: 'string', nullable: true },
            categoryId: { type: 'string' },
            isActive: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            allergens: { type: 'array', items: { type: 'string' } },
            order: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@sabor-tradicion.com' },
            password: { type: 'string', format: 'password', example: 'admin123' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 6 },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'EDITOR'] },
          },
        },
        CreateCategoryInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Entradas' },
            description: { type: 'string', example: 'Platos de entrada', nullable: true },
            icon: { type: 'string', example: '🥗', nullable: true },
            order: { type: 'integer', example: 0 },
            isActive: { type: 'boolean', example: true },
          },
        },
        CreateDishInput: {
          type: 'object',
          required: ['name', 'description', 'price', 'categoryId'],
          properties: {
            name: { type: 'string', example: 'Ensalada César' },
            description: { type: 'string', example: 'Ensalada fresca con pollo' },
            price: { type: 'number', example: 12.50 },
            categoryId: { type: 'string' },
            imageUrl: { type: 'string', nullable: true },
            isActive: { type: 'boolean', example: true },
            isFeatured: { type: 'boolean', example: false },
            allergens: { type: 'array', items: { type: 'string' }, example: ['gluten', 'lactosa'] },
            order: { type: 'integer', example: 0 },
            tags: { type: 'array', items: { type: 'string' }, example: [] },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            error: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/routes/*.ts'], // Archivos donde buscar anotaciones
};

export const swaggerSpec = swaggerJsdoc(options);

