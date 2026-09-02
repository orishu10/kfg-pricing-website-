import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db';
import { isUserRole, toModuleList, type UserRole } from '../middleware/auth';

const router = Router();

const COLUMNS = 'id, username, email, role, permissions, created_at';

const MIN_PASSWORD_LENGTH = 8;

const UNIQUE_VIOLATION = '23505';

interface UserBody {
  username?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
  permissions?: unknown;
}

const trimmed = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const emailOrNull = (value: unknown): string | null => trimmed(value) || null;

const permissionsFor = (role: UserRole, value: unknown): string =>
  JSON.stringify(role === 'user' ? toModuleList(value) : []);

const validationError = (body: UserBody, passwordRequired: boolean): string | null => {
  if (!trimmed(body.username)) return 'Username is required';
  if (!isUserRole(body.role)) return 'A valid role is required';
  const email = trimmed(body.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  const password = typeof body.password === 'string' ? body.password : '';
  if (passwordRequired || password) {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
  }
  return null;
};

const countOtherAdmins = async (excludedId: number): Promise<number> => {
  const result = await pool.query(
    "SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin' AND id <> $1",
    [excludedId],
  );
  return result.rows[0].count as number;
};

const duplicateMessage = (err: unknown): string | null => {
  const detail = (err as { code?: string; constraint?: string }) ?? {};
  if (detail.code !== UNIQUE_VIOLATION) return null;
  return detail.constraint === 'idx_users_email'
    ? 'That email is already in use'
    : 'That username is already taken';
};

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM users ORDER BY username ASC`);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const body = req.body as UserBody;
  const invalid = validationError(body, true);
  if (invalid) return res.status(400).json({ error: invalid });

  try {
    const hash = await bcrypt.hash(body.password as string, 12);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, permissions)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING ${COLUMNS}`,
      [
        trimmed(body.username),
        emailOrNull(body.email),
        hash,
        body.role as UserRole,
        permissionsFor(body.role as UserRole, body.permissions),
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const duplicate = duplicateMessage(err);
    res.status(duplicate ? 409 : 500).json({ error: duplicate ?? 'Failed to create user' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid user id' });

  const body = req.body as UserBody;
  const invalid = validationError(body, false);
  if (invalid) return res.status(400).json({ error: invalid });

  const role = body.role as UserRole;
  if (role !== 'admin' && (await countOtherAdmins(id)) === 0) {
    return res.status(409).json({ error: 'At least one administrator must remain' });
  }

  const password = typeof body.password === 'string' ? body.password : '';
  const hash = password ? await bcrypt.hash(password, 12) : null;

  try {
    const result = await pool.query(
      `UPDATE users
          SET username      = $1,
              email         = $2,
              role          = $3,
              permissions   = $4::jsonb,
              password_hash = COALESCE($5, password_hash)
        WHERE id = $6
        RETURNING ${COLUMNS}`,
      [
        trimmed(body.username),
        emailOrNull(body.email),
        role,
        permissionsFor(role, body.permissions),
        hash,
        id,
      ],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    const duplicate = duplicateMessage(err);
    res.status(duplicate ? 409 : 500).json({ error: duplicate ?? 'Failed to update user' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid user id' });
  if (req.user?.id === id) return res.status(409).json({ error: 'You cannot delete your own account' });

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
