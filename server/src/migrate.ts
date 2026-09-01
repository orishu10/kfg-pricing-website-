import fs from 'fs';
import path from 'path';
import { pool } from './db';

const DB_DIR = path.resolve(__dirname, '../../db');

const orderKey = (file: string) => (file === 'schema.sql' ? '0' : `1_${file}`);

export const runMigrations = async () => {
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
  }
};

if (require.main === module) {
  runMigrations()
    .then(() => pool.end())
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
