import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// Empty strings → null so optional VARCHAR fields store cleanly
const n = (v: unknown) => (v === '' || v === undefined ? null : v);

const PROFILE_FIELDS = [
  'short_name', 'phone', 'incoterms', 'currency', 'address', 'city', 'zip_code', 'country',
] as const;

// GET /api/customers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// POST /api/customers
router.post('/', async (req: Request, res: Response) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'id and name are required' });
  }
  const b = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (id, name, short_name, phone, incoterms, currency, address, city, zip_code, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, name, ...PROFILE_FIELDS.map((f) => n(b[f]))]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Customer ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const b = req.body;
  try {
    const result = await pool.query(
      `UPDATE customers SET
        name       = $1,
        short_name = $2,
        phone      = $3,
        incoterms  = $4,
        currency   = $5,
        address    = $6,
        city       = $7,
        zip_code   = $8,
        country    = $9
       WHERE id = $10
       RETURNING *`,
      [name, ...PROFILE_FIELDS.map((f) => n(b[f])), req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
