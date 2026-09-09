import { Router, Request, Response } from 'express';
import { appVersion, autoRefreshEnabled } from '../services/appVersion';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ version: appVersion, autoRefresh: autoRefreshEnabled });
});

export default router;
