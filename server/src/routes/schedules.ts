import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

const n = (v: unknown) => (v === '' || v === undefined ? null : v);

const COLUMNS = [
  'vessel', 'voyage', 'pol', 'pod', 'etd', 'eta', 'tt',
  'ddl_con', 'ddl_docs', 'ddl_port',
] as const;

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM schedules ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM schedules WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
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
      `INSERT INTO schedules (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create schedule' });
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
      `UPDATE schedules SET ${set} WHERE id = $${cols.length + 1} RETURNING *`,
      values,
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default router;
