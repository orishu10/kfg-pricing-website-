import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

const n = (v: unknown) => (v === '' || v === undefined ? null : v);

// Writable columns; id/created_at/updated_at/created_by/updated_by are handled separately.
const COLUMNS = [
  'customer_id', 'item_id', 'kfg_sku', 'status',
  // ex_current is display-only (live FX rate) and intentionally NOT persisted.
  'currency', 'pack_size', 'currency_pair', 'ex_rate',
  'unit_weight', 'units_in_case', 'cases_in_fcl',
  'cases_per_pallet', 'pallets_per_fcl', 'pallets', 'route', 'container_type', 'incoterms_supplier',
  'fob', 'cif', 'dap', 'ddp',
  'supplier_price_unit', 'supplier_price_case', 'supplier_price_fcl', 'supplier_price_1kg',
  'price_unit_ils', 'price_unit_usd', 'price_case_ils', 'price_case_usd', 'price_fcl_usd',
  'sub_total_1', 'sub_total_2', 'us_tariff', 'us_tariff_pct', 'import_factor',
  'kfg_commission', 'kfg_commission_pct', 'kfg_commission_total', 'tariffs_total', 'total', 'usd_nis',
  'supervision_cost', 'supervision_fees',
  'cost_unit', 'cost_case', 'cost_1kg', 'price_unit', 'price_case', 'price_1kg',
  'sap_price_unit', 'sap_price_case', 'sap_price_1kg',
] as const;

const LIST_SELECT = `
  SELECT p.*,
         c.name AS customer_name,
         i.name AS description,
         i.size AS size,
         s.name AS supplier_name
  FROM pricing p
  JOIN customers c ON c.id = p.customer_id
  JOIN items     i ON i.id = p.item_id
  JOIN suppliers s ON s.id = i.supplier_id
`;

// GET /api/pricing
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`${LIST_SELECT} ORDER BY p.id ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// GET /api/pricing/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`${LIST_SELECT} WHERE p.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pricing not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// POST /api/pricing — id is auto-generated
router.post('/', async (req: Request, res: Response) => {
  const { customer_id, item_id } = req.body;
  if (!customer_id || !item_id) {
    return res.status(400).json({ error: 'customer_id and item_id are required' });
  }
  const cols = [...COLUMNS, 'created_by', 'updated_by'];
  const values = [
    ...COLUMNS.map((c) => n(req.body[c])),
    n(req.body.created_by),
    n(req.body.updated_by),
  ];
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  try {
    const result = await pool.query(
      `INSERT INTO pricing (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23503') return res.status(400).json({ error: 'Invalid customer_id or item_id' });
    res.status(500).json({ error: 'Failed to create pricing' });
  }
});

// PUT /api/pricing/:id
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
      `UPDATE pricing SET ${set} WHERE id = $${cols.length + 1} RETURNING *`,
      values,
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pricing not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pricing' });
  }
});

// DELETE /api/pricing/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM pricing WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pricing not found' });
    res.json({ message: 'Pricing deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete pricing' });
  }
});

export default router;
