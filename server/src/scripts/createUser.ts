/**
 * One-off user creator / password resetter.
 *
 * The app is login-only (no signup route), so the first user must be seeded
 * manually. Idempotent: re-running with an existing username updates the
 * password hash.
 *
 * Usage (from server/, after `npm run build`):
 *   node dist/scripts/createUser.js <username> <password>
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
    `INSERT INTO users (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, hash]
  );
  console.log(`✓ User "${username}" created/updated`);
  await pool.end();
};

run().catch((err) => {
  console.error('✗ Failed to create user:', err);
  process.exit(1);
});
