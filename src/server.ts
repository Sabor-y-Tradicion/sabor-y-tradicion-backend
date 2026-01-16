import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Import routes
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import dishRoutes from './routes/dish.routes';
import orderRoutes from './routes/order.routes';
import tenantRoutes from './routes/tenant.routes';
import logsRoutes from './routes/logs.routes';
import superAdminRoutes from './routes/superadmin.routes';
import adminRoutes from './routes/admin.routes';
import subtagRoutes from './routes/subtag.routes';
import websiteRoutes from './routes/website.routes';

// Import middlewares
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { tenantResolutionMiddleware } from './middlewares/tenant-resolution.middleware';
import { logger } from './utils/helpers';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Get port from environment variables
const PORT = process.env.PORT || 5000;

// CORS configuration - Permisivo para desarrollo, restrictivo en producción
const corsOptions = process.env.NODE_ENV === 'development'
  ? {
      // ⚠️ SOLO PARA DESARROLLO - Permite todo
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: '*', // Permite cualquier header
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
    }
  : {
      // PRODUCCIÓN - Configuración restrictiva
      origin: (origin: string | undefined, callback: any) => {
        // Permitir requests sin origin (móviles, Postman, etc)
        if (!origin) return callback(null, true);

        // En producción, verificar dominio base y subdominios
        const baseDomain = process.env.BASE_DOMAIN || 'james.pe';

        // Permitir dominio principal y www
        const allowedOrigins = [
          `https://${baseDomain}`,
          `https://www.${baseDomain}`,
          `http://localhost:3000`, // Para testing local
        ];

        // Regex para permitir cualquier subdominio
        const subdomainRegex = new RegExp(`^https://[a-z0-9-]+\\.${baseDomain.replace('.', '\\.')}$`);

        if (allowedOrigins.includes(origin) || subdomainRegex.test(origin)) {
          callback(null, true);
        } else {
          console.warn(`❌ CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Domain', 'X-Requested-With', 'Cache-Control', 'Pragma'],
      optionsSuccessStatus: 200,
    };

// Rate limiting configuration - Más permisivo en desarrollo
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15')) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000'), // 1000 requests en desarrollo (antes 100)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for certain endpoints
  skip: (req) => {
    // No aplicar rate limit en desarrollo a /health y /docs
    if (process.env.NODE_ENV === 'development') {
      return req.path === '/health' || req.path.startsWith('/docs');
    }
    return false;
  },
});

// Middlewares
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies - Max 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies - Max 10MB
app.use(morgan('dev')); // HTTP request logger
app.use('/api/', limiter); // Apply rate limiting to all API routes

// Middleware para manejar errores de payload demasiado grande
app.use((error: any, req: any, res: any, next: any) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'La imagen es demasiado grande. El tamaño máximo permitido es 10MB. Por favor, comprime la imagen antes de subirla.',
      code: 'PAYLOAD_TOO_LARGE',
      maxSize: '10MB'
    });
  }
  next(error);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Documentation with Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Sabor y Tradición API Docs',
}));

// JSON Swagger spec
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes - Auth y Tenants domain NO requieren tenant resolution
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/website', websiteRoutes);

// Rutas públicas de Orders (NO requieren tenant resolution)
// La ruta /public maneja el tenant internamente via X-Tenant-Domain header
app.use('/api/orders', orderRoutes);

// Tenant resolution middleware (aplicar a las rutas que lo necesitan)
app.use('/api/categories', tenantResolutionMiddleware);
app.use('/api/dishes', tenantResolutionMiddleware);
app.use('/api/subtags', tenantResolutionMiddleware);

// Routes with tenant resolution applied
app.use('/api/categories', categoryRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/subtags', subtagRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;

