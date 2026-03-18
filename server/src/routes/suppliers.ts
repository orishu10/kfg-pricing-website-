import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/suppliers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM suppliers ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// POST /api/suppliers — create a supplier and optionally link to a customer
router.post('/', async (req: Request, res: Response) => {
  const { name, customer_id } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const supplierResult = await client.query(
      'INSERT INTO suppliers (name) VALUES ($1) RETURNING *',
      [name]
    );
    const supplier = supplierResult.rows[0];

    if (customer_id) {
      await client.query(
        'INSERT INTO customer_suppliers (customer_id, supplier_id) VALUES ($1, $2)',
        [customer_id, supplier.id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(supplier);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to create supplier' });
  } finally {
    client.release();
  }
});

// POST /api/suppliers/:supplierId/link/:customerId — link existing supplier to a customer
router.post('/:supplierId/link/:customerId', async (req: Request, res: Response) => {
  const { supplierId, customerId } = req.params;
  try {
    await pool.query(
      'INSERT INTO customer_suppliers (customer_id, supplier_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [customerId, supplierId]
    );
    res.status(201).json({ message: 'Supplier linked to customer' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to link supplier to customer' });
  }
});

// DELETE /api/suppliers/:supplierId/link/:customerId — unlink supplier from customer
router.delete('/:supplierId/link/:customerId', async (req: Request, res: Response) => {
  const { supplierId, customerId } = req.params;
  try {
    await pool.query(
      'DELETE FROM customer_suppliers WHERE customer_id = $1 AND supplier_id = $2',
      [customerId, supplierId]
    );
    res.json({ message: 'Supplier unlinked from customer' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlink supplier' });
  }
});

// GET /api/suppliers/:supplierId/items?customer_id=xxx — items for this supplier for a specific customer
router.get('/:supplierId/items', async (req: Request, res: Response) => {
  const { supplierId } = req.params;
  const { customer_id } = req.query;

  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id query param is required' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM items
       WHERE supplier_id = $1 AND customer_id = $2
       ORDER BY name ASC`,
      [supplierId, customer_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

export default router;
