import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { connectDatabase, isDatabaseConnected } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { tenantsRouter } from './routes/tenants.js';
import { membershipsRouter } from './routes/memberships.js';
import { classesRouter } from './routes/classes.js';
import { attendanceRouter } from './routes/attendance.js';
import { paymentsRouter } from './routes/payments.js';
import { dashboardRouter } from './routes/dashboard.js';
import { uploadRouter } from './routes/upload.js';
import { adminRegistrationsRouter } from './routes/registrations.js';
import { notificationsRouter } from './routes/notifications.js';
import { membershipPlansRouter } from './routes/membership-plans.js';
import { mePrivatePlansRouter } from './routes/me-private-plans.js';
import { mePrivateSessionsRouter } from './routes/me-private-sessions.js';
import { mePrivateStudentsRouter } from './routes/me-private-students.js';
import { studentPrivateRouter } from './routes/student-private.js';
import { SchedulerService } from './services/scheduler.service.js';
import { SERVER_CONFIG, isProduction, isDevelopment, FEATURE_FLAGS, validateConfig } from './config/app.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate configuration on startup
validateConfig();

const app = express();
const PORT = SERVER_CONFIG.PORT;

// Trust proxy - Required for rate limiting and correct IP detection behind proxies (Fly.io, etc.)
// For Fly.io, we trust only the first proxy (Fly.io's load balancer)
// This is more secure than trusting all proxies, which would allow IP spoofing
// Setting to 1 means we trust only the first proxy in the chain
app.set('trust proxy', 1);

// Helper function to check if origin is allowed
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true; // Allow requests with no origin
  
  // In development, allow any localhost with any port
  if (!isProduction && origin.startsWith('http://localhost:')) {
    return true;
  }
  
  // In production, allow any *.fly.dev domain
  if (isProduction && origin.includes('.fly.dev')) {
    return true;
  }
  
  // Check whitelist
  const allowedOrigins = [
    SERVER_CONFIG.FRONTEND_URL,
    'https://pantera-negra-web.fly.dev',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:8080', // Backend port (for testing)
    'https://pantera-negra-wep-app-long-cloud-8389.fly.dev',
  ].filter(Boolean) as string[];
  
  return allowedOrigins.includes(origin);
};

// Handle preflight requests explicitly (must be before CORS middleware)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  if (isDevelopment) {
    console.log(`🔍 [CORS] OPTIONS request from origin: ${origin}`);
  }
  
  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-Slug, X-Tenant-ID');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    if (isDevelopment) {
      console.log(`✅ [CORS] Allowed preflight request from: ${origin}`);
    }
    return res.sendStatus(200);
  }
  
  // If origin is not allowed, still send CORS headers to prevent browser CORS error
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-Slug, X-Tenant-ID');
  if (isDevelopment) {
    console.log(`⚠️  [CORS] Rejected preflight request from: ${origin}`);
  }
  res.status(403).json({ error: 'CORS: Origin not allowed' });
});

// Middleware - CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  [CORS] Blocked origin: ${origin}`);
      // In development, be more permissive
      if (!isProduction) {
        console.warn(`⚠️  [CORS] Allowing anyway in development mode`);
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug', 'X-Tenant-ID'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  const dbStatus = isDatabaseConnected() ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Auth Routes (public)
app.use('/api/auth', authRouter);

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/memberships', membershipsRouter);
app.use('/api/classes', classesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin/registrations', adminRegistrationsRouter);
app.use('/api/admin/membership-plans', membershipPlansRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/me/private', mePrivatePlansRouter);
app.use('/api/me/private', mePrivateSessionsRouter);
app.use('/api/me/private', mePrivateStudentsRouter);
app.use('/api/me/private', studentPrivateRouter);

// Serve static files in production (web app)
if (isProduction) {
  // Try multiple possible paths for the public directory
  const possiblePublicPaths = [
    join(__dirname, 'public'),
    join(__dirname, '..', 'public'),
    join(process.cwd(), 'public'),
    join(process.cwd(), 'packages', 'api', 'public'),
  ];

  let publicPath: string | null = null;
  for (const path of possiblePublicPaths) {
    try {
      if (existsSync(path)) {
        publicPath = path;
        break;
      }
    } catch {
      // Continue to next path
    }
  }

  if (publicPath) {
    app.use(express.static(publicPath));
    console.log(`📦 Serving static files from: ${publicPath}`);
    
    // SPA fallback: serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
      // Skip if it's an API route
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
      }
      
      const indexPath = join(publicPath!, 'index.html');
      if (existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  } else {
    console.warn('⚠️  Static files directory not found. Web app will not be served.');
  }
}

// Error handling
app.use(errorHandler);

  // Start server
  async function startServer() {
    // Start the server first, even if MongoDB connection fails
    // This ensures Fly.io can reach the health check endpoint
    const HOST = SERVER_CONFIG.HOST;
    
    app.listen(Number(PORT), HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
    });

    // Attempt to connect to MongoDB (non-blocking)
    const dbConnected = await connectDatabase();
    
    if (dbConnected) {
      // Initialize and start schedulers only if DB is connected
      if (FEATURE_FLAGS.ENABLE_SCHEDULERS) {
        try {
          await SchedulerService.initialize();
          SchedulerService.start();
          console.log('⏰ Schedulers started');
        } catch (error) {
          console.error('⚠️  Failed to start schedulers:', error);
        }
      } else {
        console.log('⏸️  Schedulers disabled (ENABLE_SCHEDULERS=false)');
      }
    } else {
      console.warn('⚠️  Server started but MongoDB is not connected. Some features may not work.');
      console.warn('⚠️  Check MONGODB_URI environment variable and MongoDB connection.');
    }
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    SchedulerService.stop();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    SchedulerService.stop();
    process.exit(0);
  });

startServer();

