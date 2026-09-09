import express, { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db';

const router = Router();

const n = (v: unknown) => (v === '' || v === undefined ? null : v);

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg'];

const ROUTE_SELECT = `SELECT r.*, f.filename AS file_name, f.size_bytes AS file_size,
                             f.created_at AS file_uploaded_at
                        FROM routes r
                        LEFT JOIN route_files f ON f.route_id = r.id`;

const safeFilename = (value: unknown): string =>
  String(value ?? '').split(/[\\/]/).pop()!.trim().slice(0, 255);

const extensionOf = (filename: string): string => filename.split('.').pop()!.toLowerCase();

const contentDisposition = (filename: string): string =>
  `attachment; filename="${filename.replace(/[^ -~]/g, '_')}"; `
  + `filename*=UTF-8''${encodeURIComponent(filename)}`;

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
    const result = await pool.query(`${ROUTE_SELECT} ORDER BY r.id ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

interface SentNotificationRow {
  route_id: string;
  stage: string;
  sent_at: Date;
}

router.get('/expiry-notifications', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<SentNotificationRow>(
      `SELECT n.route_id, n.stage, n.sent_at
         FROM route_expiry_notifications n
         JOIN routes r ON r.id = n.route_id AND r.validity = n.validity
        ORDER BY n.sent_at DESC`,
    );
    const sentStages: Record<string, string[]> = {};
    for (const row of result.rows) {
      if (!sentStages[row.route_id]) sentStages[row.route_id] = [];
      sentStages[row.route_id].push(row.stage);
    }
    const lastSentAt = result.rows.length > 0 ? result.rows[0].sent_at : null;
    res.json({ lastSentAt, sentStages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch route expiry notifications' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`${ROUTE_SELECT} WHERE r.id = $1`, [req.params.id]);
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

router.get('/:id/file', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT filename, mime_type, content FROM route_files WHERE route_id = $1',
      [req.params.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'This route has no file' });
    const { filename, mime_type, content } = result.rows[0];
    res.setHeader('Content-Type', mime_type);
    res.setHeader('Content-Disposition', contentDisposition(filename));
    res.send(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download the file' });
  }
});

router.post(
  '/:id/file',
  express.raw({ type: '*/*', limit: MAX_FILE_BYTES }),
  async (req: Request, res: Response) => {
    const filename = safeFilename(req.query.name);
    const content = req.body;
    if (!filename) return res.status(400).json({ error: 'A file name is required' });
    if (!ALLOWED_EXTENSIONS.includes(extensionOf(filename))) {
      return res.status(400).json({ error: `Allowed file types: ${ALLOWED_EXTENSIONS.join(', ')}` });
    }
    if (!Buffer.isBuffer(content) || content.length === 0) {
      return res.status(400).json({ error: 'The file is empty' });
    }
    const mimeType = String(req.query.type || 'application/octet-stream').slice(0, 150);
    try {
      const result = await pool.query(
        `INSERT INTO route_files (route_id, filename, mime_type, size_bytes, content, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (route_id) DO UPDATE SET
           filename    = EXCLUDED.filename,
           mime_type   = EXCLUDED.mime_type,
           size_bytes  = EXCLUDED.size_bytes,
           content     = EXCLUDED.content,
           uploaded_by = EXCLUDED.uploaded_by,
           created_at  = NOW()
         RETURNING filename AS file_name, size_bytes AS file_size, created_at AS file_uploaded_at`,
        [req.params.id, filename, mimeType, content.length, content, n(req.user?.username)],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if ((err as { code?: string }).code === '23503') {
        return res.status(404).json({ error: 'Route not found' });
      }
      res.status(500).json({ error: 'Failed to upload the file' });
    }
  },
);

router.delete('/:id/file', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM route_files WHERE route_id = $1 RETURNING route_id',
      [req.params.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'This route has no file' });
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete the file' });
  }
});

router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if ((err as { type?: string }).type === 'entity.too.large') {
    return res.status(413).json({ error: 'The file is larger than 10 MB' });
  }
  next(err);
});

export default router;
