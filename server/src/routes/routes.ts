import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAdmin } from '../middleware/auth';
import { runRouteExpiryNotifications } from '../services/routeExpiryNotifier';

const router = Router();

const n = (v: unknown) => (v === '' || v === undefined ? null : v);

const COLUMNS = [
  'reference', 'agent', 'shipping_line', 'origin', 'destination',
  'origin_port', 'destination_port', 'container_type', 'tt', 'validity',
  'usd_rate', 'eur_rate',
  'fob_currency', 'fob_ils', 'fob_usd', 'fob_eur',
  'cif_currency', 'cif_ils', 'cif_usd', 'cif_eur',
  'dap_currency', 'dap_ils', 'dap_usd', 'dap_eur',
  'ddp_currency', 'ddp_ils', 'ddp_usd', 'ddp_eur',
  'total_currency', 'total_cost',
] as const;

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM routes ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

router.post('/expiry-alerts/run', requireAdmin, async (_req: Request, res: Response) => {
  try {
    res.json(await runRouteExpiryNotifications());
  } catch (err) {
    res.status(500).json({ error: 'Failed to send route validity alerts' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM routes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Route not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const cols = [...COLUMNS, 'created_by', 'updated_by'];
  const values = [
    ...COLUMNS.map((c) => n(req.body[c])),
    n(req.body.created_by),
    n(req.body.updated_by),
  ];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  try {
    const result = await pool.query(
      `INSERT INTO routes (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create route' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const cols = [...COLUMNS, 'updated_by'];
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const values = [
    ...COLUMNS.map((c) => n(req.body[c])),
    n(req.body.updated_by),
    req.params.id,
  ];
  try {
    const result = await pool.query(
      `UPDATE routes SET ${set} WHERE id = $${cols.length + 1} RETURNING *`,
      values,
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Route not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update route' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

export default router;
