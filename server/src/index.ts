import express from 'express';
import cors from 'cors';
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

app.use(cors());
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
