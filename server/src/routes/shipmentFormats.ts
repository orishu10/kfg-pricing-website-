import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAdmin } from '../middleware/auth';

const router = Router();

const UNIQUE_VIOLATION = '23505';

const fieldsJson = (value: unknown) =>
  JSON.stringify(Array.isArray(value) ? value.filter((field) => typeof field === 'string') : []);

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM shipment_formats ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch formats' });
  }
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const name = String(req.body.name ?? '').trim();
  if (!name) return res.status(400).json({ error: 'Format name is required' });
  try {
    const result = await pool.query(
      `INSERT INTO shipment_formats (name, fields, created_by, updated_by)
       VALUES ($1, $2, $3, $3) RETURNING *`,
      [name, fieldsJson(req.body.fields), req.body.updated_by ?? null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if ((err as { code?: string }).code === UNIQUE_VIOLATION) {
      return res.status(409).json({ error: 'A format with that name already exists' });
    }
    res.status(500).json({ error: 'Failed to create format' });
  }
});

router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const name = String(req.body.name ?? '').trim();
  if (!name) return res.status(400).json({ error: 'Format name is required' });
  try {
    const result = await pool.query(
      `UPDATE shipment_formats SET name = $1, fields = $2, updated_by = $3
       WHERE id = $4 RETURNING *`,
      [name, fieldsJson(req.body.fields), req.body.updated_by ?? null, req.params.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Format not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if ((err as { code?: string }).code === UNIQUE_VIOLATION) {
      return res.status(409).json({ error: 'A format with that name already exists' });
    }
    res.status(500).json({ error: 'Failed to update format' });
  }
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM shipment_formats WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Format not found' });
    res.json({ message: 'Format deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete format' });
  }
});

export default router;
