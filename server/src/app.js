import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import shopsRoutes from './routes/shops.routes.js';
import groupsRoutes from './routes/groups.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
if (!config.isProd) {
  app.use(morgan('dev'));
}

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      code: 'TOO_MANY_REQUESTS',
    },
  },
});
app.use('/api', apiLimiter);

// API Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Handle 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
