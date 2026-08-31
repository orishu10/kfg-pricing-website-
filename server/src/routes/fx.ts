import { Router, Request, Response } from 'express';

const router = Router();

const BOI_URL = 'https://boi.org.il/PublicApi/GetExchangeRates';
const TTL = 10 * 60 * 1000;

interface BoiRate {
  key: string;
  currentExchangeRate: number;
  unit: number;
}

let cache: { at: number; data: Record<string, number> } | null = null;

const load = async (): Promise<Record<string, number>> => {
  const res = await fetch(BOI_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`BOI responded ${res.status}`);
  const json = (await res.json()) as { exchangeRates?: BoiRate[] };
  const map: Record<string, number> = {};
  for (const r of json.exchangeRates ?? []) {
    if (r.unit > 0) map[r.key] = r.currentExchangeRate / r.unit;
  }
  return map;
};

router.get('/', async (_req: Request, res: Response) => {
  try {
    if (!cache || Date.now() - cache.at > TTL) {
      cache = { at: Date.now(), data: await load() };
    }
    res.json({ USD: cache.data.USD ?? null, EUR: cache.data.EUR ?? null });
  } catch {
    if (cache) {
      res.json({ USD: cache.data.USD ?? null, EUR: cache.data.EUR ?? null });
      return;
    }
    res.status(502).json({ error: 'Failed to fetch exchange rates' });
  }
});

export default router;
