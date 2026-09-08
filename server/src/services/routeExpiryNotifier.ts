import { pool } from '../db';
import { isMailConfigured, sendMail } from './mailer';
import {
  EXPIRY_STAGES,
  routeEmailHtml,
  routeEmailSubject,
  routeEmailText,
  stageForDaysLeft,
  type ExpiringRoute,
  type ExpiryStage,
} from './routeExpiryEmail';

interface PendingRoute extends ExpiringRoute {
  sent_stages: ExpiryStage[];
}

const TICK_MS = 15 * 60 * 1000;

const DEFAULT_ALERT_HOUR = 8;

const DEFAULT_ALERT_TIMEZONE = 'Asia/Jerusalem';

const DEFAULT_ALERT_RECIPIENTS = ['log.il@kfg.co.il'];

const alertHour = (): number => {
  const parsed = Number(process.env.ROUTE_ALERT_HOUR);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 23 ? parsed : DEFAULT_ALERT_HOUR;
};

const alertTimezone = (): string => process.env.ROUTE_ALERT_TIMEZONE?.trim() || DEFAULT_ALERT_TIMEZONE;

const currentHour = (): number => {
  try {
    return Number(
      new Intl.DateTimeFormat('en-GB', { hourCycle: 'h23', hour: '2-digit', timeZone: alertTimezone() })
        .format(new Date()),
    );
  } catch {
    console.warn(`⚠ Unknown ROUTE_ALERT_TIMEZONE "${alertTimezone()}" — falling back to server time`);
    return new Date().getHours();
  }
};

const recipients = (): string[] => {
  const configured = (process.env.ROUTE_ALERT_RECIPIENTS ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : DEFAULT_ALERT_RECIPIENTS;
};

const loadPendingRoutes = async (): Promise<PendingRoute[]> => {
  const result = await pool.query<PendingRoute>(
    `SELECT r.id, r.reference, r.agent, r.shipping_line, r.origin, r.destination,
            r.origin_port, r.destination_port, r.validity,
            (r.validity - CURRENT_DATE)::int AS days_left,
            COALESCE(sent.stages, ARRAY[]::varchar[]) AS sent_stages
       FROM routes r
       LEFT JOIN LATERAL (
            SELECT array_agg(n.stage) AS stages
              FROM route_expiry_notifications n
             WHERE n.route_id = r.id AND n.validity = r.validity
       ) sent ON TRUE
      WHERE r.validity IS NOT NULL
        AND r.validity <= CURRENT_DATE + 7
      ORDER BY r.validity ASC, r.id ASC`,
  );
  return result.rows;
};

const recordSent = async (stage: ExpiryStage, route: ExpiringRoute): Promise<void> => {
  await pool.query(
    `INSERT INTO route_expiry_notifications (route_id, stage, validity)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [route.id, stage, route.validity],
  );
};

const collectDueRoutes = async (): Promise<Map<ExpiryStage, ExpiringRoute[]>> => {
  const pending = await loadPendingRoutes();
  const dueByStage = new Map<ExpiryStage, ExpiringRoute[]>();

  pending.forEach((route) => {
    const stage = stageForDaysLeft(route.days_left);
    if (route.sent_stages.includes(stage)) return;
    dueByStage.set(stage, [...(dueByStage.get(stage) ?? []), route]);
  });

  return dueByStage;
};

const runRouteExpiryNotifications = async (): Promise<void> => {
  const dueByStage = await collectDueRoutes();
  if (dueByStage.size === 0) return;

  const to = recipients();
  let delivered = 0;

  for (const stage of EXPIRY_STAGES) {
    for (const route of dueByStage.get(stage) ?? []) {
      const sent = await sendMail({
        to,
        subject: routeEmailSubject(route),
        html: routeEmailHtml(route),
        text: routeEmailText(route),
      });
      if (!sent) continue;
      await recordSent(stage, route);
      delivered += 1;
    }
  }

  if (delivered > 0) {
    console.log(`✓ Route validity alerts sent (${delivered} email(s) to ${to.join(', ')})`);
  }
};

export const startRouteExpiryNotifier = (): void => {
  if (!isMailConfigured()) {
    console.warn('⚠ Route validity alerts disabled — SMTP_HOST is not set');
    return;
  }

  const tick = () => {
    if (currentHour() < alertHour()) return;
    runRouteExpiryNotifications().catch((err) =>
      console.error('✗ Route validity alerts failed:', err),
    );
  };

  tick();
  setInterval(tick, TICK_MS);
  console.log(
    `✓ Route validity alerts scheduled daily from ${String(alertHour()).padStart(2, '0')}:00 ${alertTimezone()}`,
  );
};
