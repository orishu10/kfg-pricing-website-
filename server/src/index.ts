import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { pool } from './db';
import customersRouter from './routes/customers';
import suppliersRouter from './routes/suppliers';
import itemsRouter from './routes/items';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Comma-separated list of allowed browser origins, e.g.
// "https://pricing.example.com,https://www.pricing.example.com".
// If unset (local dev), all origins are allowed.
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : null;

// Default helmet CSP is `style-src 'self'`, which blocks the inline <style>
// tags MUI/emotion inject at runtime. Allow inline styles (and data/blob
// images used by the UI) while keeping the rest of helmet's protections.
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
    origin: (origin, callback) => {
      // Allow same-origin / non-browser requests (no Origin header) and,
      // when CLIENT_ORIGIN is unset, any origin (dev convenience).
      if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(compression());
app.use(express.json());

// GET responses revalidate with the built-in ETag: unchanged data returns
// an empty 304 instead of the full JSON body, but is never served stale.
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') res.set('Cache-Control', 'private, no-cache');
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/items', itemsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// In production the built React client is served from the same origin as the
// API, so the client's relative `/api` calls need no CORS. Vite builds to
// client/dist; from the compiled server/dist that's ../../client/dist. The
// folder is absent in local dev (Vite serves the client on :5173), so this
// block is skipped there.
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: any non-API GET returns index.html so React Router can
  // resolve client-side routes on refresh / deep-link.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const start = async () => {
  if (!process.env.JWT_SECRET) {
    console.error('✗ JWT_SECRET is not set — refusing to start');
    process.exit(1);
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✓ Database connected');
  } catch (err) {
    console.error('✗ Database connection failed:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
};

start();
