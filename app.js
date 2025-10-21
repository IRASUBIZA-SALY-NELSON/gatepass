import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import gateRoutes from './routes/gateRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import swaggerSpec from './docs/swagger.js';

// Load env from config/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config/.env') });

const app = express();

// Logging
app.use(morgan('dev'));

// CORS
const origins = process.env.CORS_ORIGINS || '*';
const originList = origins === '*' ? '*' : origins.split(',').map((o) => o.trim());
app.use(
    cors({
        origin: originList,
        credentials: true,
    })
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'gatepass-auth' }));

// Public Swagger Docs
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/gate', gateRoutes);
app.use('/api/payments', paymentRoutes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

export default app;
