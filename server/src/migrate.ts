/**
 * Lightweight, idempotent SQL migration runner.
 *
 * Applies every *.sql file in /db that hasn't been applied yet, in order,
 * recording each one in a `schema_migrations` table. Safe to run repeatedly
 * and on every deploy — already-applied files are skipped.
 *
 *   npm run migrate        (after `npm run build`)
 *   npm run migrate:dev    (from source, no build)
 */
import fs from 'fs';
import path from 'path';
import { pool } from './db';

const DB_DIR = path.resolve(__dirname, '../../db');

// schema.sql defines the base tables and must run before any migration_*.sql.
// Everything else runs in alphabetical order (migration_001, 002, ...).
const orderKey = (file: string) => (file === 'schema.sql' ? '0' : `1_${file}`);

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const applied = new Set(
      (await client.query<{ filename: string }>('SELECT filename FROM schema_migrations')).rows.map(
        (r) => r.filename
      )
    );

    const files = fs
      .readdirSync(DB_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort((a, b) => orderKey(a).localeCompare(orderKey(b)));

    const pending = files.filter((f) => !applied.has(f));
    if (pending.length === 0) {
      console.log('✓ No pending migrations — database is up to date');
      return;
    }

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(DB_DIR, file), 'utf8');
      // Each file runs in its own transaction: it either fully applies and is
      // recorded, or rolls back entirely so it can be retried.
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✓ Applied ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`✗ Failed on ${file} — rolled back. No further migrations run.`);
        throw err;
      }
    }

    console.log(`✓ Done — ${pending.length} migration(s) applied`);
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
