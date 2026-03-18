import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/items/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM items WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST /api/items
router.post('/', async (req: Request, res: Response) => {
  const { id, name, customer_id, supplier_id, final_price } = req.body;
  if (!id || !name || !customer_id || !supplier_id) {
    return res.status(400).json({ error: 'id, name, customer_id, and supplier_id are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO items (id, name, customer_id, supplier_id, final_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, name, customer_id, supplier_id, final_price ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Item ID already exists' });
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid customer_id or supplier_id, or supplier is not linked to this customer' });
    }
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/items/:id — update all editable fields (everything except id)
router.put('/:id', async (req: Request, res: Response) => {
  const { name, final_price } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const result = await pool.query(
      `UPDATE items
       SET name = $1, final_price = $2
       WHERE id = $3
       RETURNING *`,
      [name, final_price ?? null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
