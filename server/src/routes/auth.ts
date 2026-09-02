import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtSecret, loadAuthUser, isUserRole, toModuleList } from '../middleware/auth';

const router = Router();

// Throttle credential-guessing: max 10 login attempts per IP per 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      username: user.username,
      role: isUserRole(user.role) ? user.role : 'customer',
      permissions: toModuleList(user.permissions),
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/verify  — token check that returns the live role and permissions
router.post('/verify', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  let id: number;
  try {
    ({ id } = jwt.verify(auth.slice(7), jwtSecret()) as { id: number });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
  try {
    const user = await loadAuthUser(id);
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });
    res.json({ username: user.username, role: user.role, permissions: user.permissions });
  } catch {
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
