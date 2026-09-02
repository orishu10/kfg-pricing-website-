import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

const CATEGORIES = [
  'incoterms', 'currency_pair', 'country', 'container', 'shipping_line', 'sea_port',
] as const;

type Category = (typeof CATEGORIES)[number];

const isCategory = (v: unknown): v is Category =>
  typeof v === 'string' && (CATEGORIES as readonly string[]).includes(v);

router.get('/', async (req: Request, res: Response) => {
  const { category } = req.query;
  try {
    if (category !== undefined) {
      if (!isCategory(category)) return res.status(400).json({ error: 'Unknown category' });
      const result = await pool.query(
        'SELECT * FROM lookup_options WHERE category = $1 AND active = TRUE ORDER BY sort_order ASC, value ASC',
        [category],
      );
      return res.json(result.rows);
    }

    const result = await pool.query(
      'SELECT * FROM lookup_options WHERE active = TRUE ORDER BY sort_order ASC, value ASC',
    );
    const grouped = Object.fromEntries(CATEGORIES.map((c) => [c, [] as unknown[]]));
    for (const row of result.rows) {
      if (isCategory(row.category)) grouped[row.category].push(row);
    }
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lookups' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { category } = req.body;
  const value = typeof req.body.value === 'string' ? req.body.value.trim() : '';
  if (!isCategory(category)) return res.status(400).json({ error: 'Unknown category' });
  if (!value) return res.status(400).json({ error: 'Value is required' });
  if (value.length > 255) return res.status(400).json({ error: 'Value is too long' });
  try {
    const next = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS sort_order FROM lookup_options WHERE category = $1',
      [category],
    );
    const result = await pool.query(
      'INSERT INTO lookup_options (category, value, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [category, value, next.rows[0].sort_order],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      return res.status(409).json({ error: 'That value already exists' });
    }
    res.status(500).json({ error: 'Failed to create option' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  const fields: string[] = [];
  const values: unknown[] = [];
  if (typeof req.body.value === 'string') {
    const value = req.body.value.trim();
    if (!value) return res.status(400).json({ error: 'Value is required' });
    if (value.length > 255) return res.status(400).json({ error: 'Value is too long' });
    values.push(value);
    fields.push(`value = $${values.length}`);
  }
  if (typeof req.body.active === 'boolean') {
    values.push(req.body.active);
    fields.push(`active = $${values.length}`);
  }
  if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });
  values.push(req.params.id);
  try {
    const result = await pool.query(
      `UPDATE lookup_options SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Option not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      return res.status(409).json({ error: 'That value already exists' });
    }
    res.status(500).json({ error: 'Failed to update option' });
  }
});

router.put('/reorder', async (req: Request, res: Response) => {
  const { category, ids } = req.body;
  if (!isCategory(category)) return res.status(400).json({ error: 'Unknown category' });
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < ids.length; i += 1) {
      await client.query(
        'UPDATE lookup_options SET sort_order = $1 WHERE id = $2 AND category = $3',
        [i + 1, ids[i], category],
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Reordered' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to reorder options' });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'UPDATE lookup_options SET active = FALSE WHERE id = $1 RETURNING id',
      [req.params.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Option not found' });
    res.json({ message: 'Option deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete option' });
  }
});

export default router;
