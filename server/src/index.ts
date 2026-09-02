import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { pool } from './db';
import { runMigrations } from './migrate';
import customersRouter from './routes/customers';
import suppliersRouter from './routes/suppliers';
import itemsRouter from './routes/items';
import pricingRouter from './routes/pricing';
import routesRouter from './routes/routes';
import lookupsRouter from './routes/lookups';
import weeklyShipmentsRouter from './routes/weeklyShipments';
import shipmentFormatsRouter from './routes/shipmentFormats';
import schedulesRouter from './routes/schedules';
import fxRouter from './routes/fx';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import { requireAuth, requireAdmin, requireInternalUser, requireModuleForWrites } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : null;

const isOriginAllowed = (origin?: string) =>
  !origin || !allowedOrigins || allowedOrigins.includes(origin);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'connect-src': ["'self'"],
      },
    },
  })
);
app.use(
  cors({
    origin: (origin, callback) =>
      isOriginAllowed(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS')),
  })
);
app.use(compression());
app.use(express.json());

app.use('/api', (req, res, next) => {
  if (req.method === 'GET') res.set('Cache-Control', 'private, no-cache');
  next();
});

const internalAccess = [requireAuth, requireInternalUser];
const dbmAccess = [...internalAccess, requireModuleForWrites('dbm')];
const pricingAccess = [...internalAccess, requireModuleForWrites('pricing')];
const logisticsAccess = [...internalAccess, requireModuleForWrites('logistics')];

app.use('/api/auth', authRouter);
app.use('/api/users', requireAuth, requireAdmin, usersRouter);
app.use('/api/customers', dbmAccess, customersRouter);
app.use('/api/suppliers', dbmAccess, suppliersRouter);
app.use('/api/items', dbmAccess, itemsRouter);
app.use('/api/lookups', dbmAccess, lookupsRouter);
app.use('/api/pricing', pricingAccess, pricingRouter);
app.use('/api/routes', logisticsAccess, routesRouter);
app.use('/api/weekly-shipments', logisticsAccess, weeklyShipmentsRouter);
app.use('/api/shipment-formats', internalAccess, shipmentFormatsRouter);
app.use('/api/schedules', logisticsAccess, schedulesRouter);
app.use('/api/fx', internalAccess, fxRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const serveClientBuild = () => {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (!fs.existsSync(clientDist)) return;
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
};

serveClientBuild();

const connectDatabase = async () => {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
};

const start = async () => {
  if (!process.env.JWT_SECRET) {
    console.error('✗ JWT_SECRET is not set — refusing to start');
    process.exit(1);
  }

  try {
    await connectDatabase();
    console.log('✓ Database connected');
  } catch (err) {
    console.error('✗ Database connection failed:', err);
    process.exit(1);
  }

  try {
    await runMigrations();
  } catch (err) {
    console.error('✗ Migrations failed (starting anyway):', err);
  }

  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
};

start();
