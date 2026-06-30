import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
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

app.use(helmet());
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
