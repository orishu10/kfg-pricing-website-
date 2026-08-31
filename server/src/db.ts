import { Pool, types } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

types.setTypeParser(1082, (v) => v);

// Managed Postgres providers (Render, Railway, Heroku, etc.) require TLS.
// Enable it whenever DB_SSL=true or a single DATABASE_URL is provided.
const useSsl = process.env.DB_SSL === 'true' || !!process.env.DATABASE_URL;

export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'kfg_pricing',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      }
);
