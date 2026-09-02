/**
 * One-off administrator creator / password resetter.
 *
 * The app has no signup route, so the first administrator must be seeded
 * manually; everyone else is created from the in-app Users page. Idempotent:
 * re-running with an existing username updates the password and restores the
 * admin role.
 *
 * Usage (from server/, after `npm run build`):
 *   node dist/scripts/createUser.js <username> <password> [email]
 * or via environment variables:
 *   ADMIN_USERNAME=alice ADMIN_PASSWORD=secret node dist/scripts/createUser.js
 *
 * On Railway, run it against the live DB with:
 *   railway run node dist/scripts/createUser.js <username> <password>
 */
import bcrypt from 'bcrypt';
import { pool } from '../db';

const username = process.argv[2] || process.env.ADMIN_USERNAME;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;
const email = process.argv[4] || process.env.ADMIN_EMAIL || null;

const run = async () => {
  if (!username || !password) {
    console.error(
      'Usage: node dist/scripts/createUser.js <username> <password>\n' +
        '   or set ADMIN_USERNAME and ADMIN_PASSWORD environment variables.'
    );
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (username, email, password_hash, role, permissions)
     VALUES ($1, $2, $3, 'admin', '[]'::jsonb)
     ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            email         = COALESCE(EXCLUDED.email, users.email),
            role          = 'admin'`,
    [username, email, hash]
  );
  console.log(`✓ Administrator "${username}" created/updated`);
  await pool.end();
};

run().catch((err) => {
  console.error('✗ Failed to create user:', err);
  process.exit(1);
});
