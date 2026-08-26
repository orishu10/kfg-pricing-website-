import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Empty strings → null so optional VARCHAR fields store cleanly
const n = (v: unknown) => (v === '' || v === undefined ? null : v);

const PROFILE_FIELDS = [
  'short_name', 'phone', 'incoterms', 'address', 'city', 'zip_code', 'country',
] as const;

// GET /api/suppliers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET /api/suppliers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// POST /api/suppliers
router.post('/', async (req: Request, res: Response) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'id and name are required' });
  }
  const b = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO suppliers (id, name, short_name, phone, incoterms, address, city, zip_code, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, name, ...PROFILE_FIELDS.map((f) => n(b[f]))]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Supplier ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const b = req.body;
  try {
    const result = await pool.query(
      `UPDATE suppliers SET
        name       = $1,
        short_name = $2,
        phone      = $3,
        incoterms  = $4,
        address    = $5,
        city       = $6,
        zip_code   = $7,
        country    = $8
       WHERE id = $9
       RETURNING *`,
      [name, ...PROFILE_FIELDS.map((f) => n(b[f])), req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

export default router;
