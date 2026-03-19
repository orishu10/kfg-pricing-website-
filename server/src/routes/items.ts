import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

const ITEM_SELECT = `
  SELECT i.*,
         s.name AS supplier_name,
         c.name AS customer_name
  FROM items i
  JOIN suppliers s ON s.id = i.supplier_id
  JOIN customers c ON c.id = i.customer_id
`;

// GET /api/items/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`${ITEM_SELECT} WHERE i.id = $1`, [req.params.id]);
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
  const { id, name, customer_id, supplier_id } = req.body;
  if (!id || !name || !customer_id || !supplier_id) {
    return res.status(400).json({ error: 'id, name, customer_id, and supplier_id are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO items (id, name, customer_id, supplier_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, name, customer_id, supplier_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Item ID already exists' });
    if (err.code === '23503') return res.status(400).json({ error: 'Invalid customer_id / supplier_id or supplier not linked to customer' });
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/items/:id
router.put('/:id', async (req: Request, res: Response) => {
  const {
    name,
    supplier_incoterms, customer_incoterms,
    logistics, container_type,
    fob, cif, dap, ddp,
    cases_in_fcl, units_in_case, unit_weight,
    cases_per_pallet, pallets_per_fcl,
    supplier_price_unit, supplier_price_case, supplier_price_fcl, supplier_price_1kg,
    sub_total_1, us_tariff, sub_total_2,
    import_factor, kfg_commission, total,
    kfg_commission_total, tariffs_total, usd_nis,
    cost_unit, cost_case,
    price_unit, price_case,
    sap_price_unit, sap_price_case,
  } = req.body;

  if (!name) return res.status(400).json({ error: 'name is required' });

  const n = (v: unknown) => (v === '' || v === undefined ? null : v);

  try {
    const result = await pool.query(
      `UPDATE items SET
        name                  = $1,
        supplier_incoterms    = $2,
        customer_incoterms    = $3,
        logistics             = $4,
        container_type        = $5,
        fob                   = $6,
        cif                   = $7,
        dap                   = $8,
        ddp                   = $9,
        cases_in_fcl          = $10,
        units_in_case         = $11,
        unit_weight           = $12,
        cases_per_pallet      = $13,
        pallets_per_fcl       = $14,
        supplier_price_unit   = $15,
        supplier_price_case   = $16,
        supplier_price_fcl    = $17,
        supplier_price_1kg    = $18,
        sub_total_1           = $19,
        us_tariff             = $20,
        sub_total_2           = $21,
        import_factor         = $22,
        kfg_commission        = $23,
        total                 = $24,
        kfg_commission_total  = $25,
        tariffs_total         = $26,
        usd_nis               = $27,
        cost_unit             = $28,
        cost_case             = $29,
        price_unit            = $30,
        price_case            = $31,
        sap_price_unit        = $32,
        sap_price_case        = $33
       WHERE id = $34
       RETURNING *`,
      [
        name,
        n(supplier_incoterms), n(customer_incoterms),
        n(logistics), n(container_type),
        n(fob), n(cif), n(dap), n(ddp),
        n(cases_in_fcl), n(units_in_case), n(unit_weight),
        n(cases_per_pallet), n(pallets_per_fcl),
        n(supplier_price_unit), n(supplier_price_case), n(supplier_price_fcl), n(supplier_price_1kg),
        n(sub_total_1), n(us_tariff), n(sub_total_2),
        n(import_factor), n(kfg_commission), n(total),
        n(kfg_commission_total), n(tariffs_total), n(usd_nis),
        n(cost_unit), n(cost_case),
        n(price_unit), n(price_case),
        n(sap_price_unit), n(sap_price_case),
        req.params.id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
