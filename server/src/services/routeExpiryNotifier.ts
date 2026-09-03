import { pool } from '../db';
import { isMailConfigured, sendMail } from './mailer';
import {
  EXPIRY_STAGES,
  stageEmailHtml,
  stageEmailText,
  stageForDaysLeft,
  stageSubject,
  type ExpiringRoute,
  type ExpiryStage,
} from './routeExpiryEmail';

interface PendingRoute extends ExpiringRoute {
  sent_stages: ExpiryStage[];
}

const TICK_MS = 15 * 60 * 1000;

const DEFAULT_ALERT_HOUR = 8;

const DEFAULT_ALERT_TIMEZONE = 'Asia/Jerusalem';

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

const loadRecipients = async (): Promise<string[]> => {
  const result = await pool.query<{ email: string }>(
    "SELECT DISTINCT email FROM users WHERE role = 'admin' AND email IS NOT NULL AND email <> '' ORDER BY email",
  );
  return result.rows.map((row) => row.email);
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

const recordSent = async (stage: ExpiryStage, routes: ExpiringRoute[]): Promise<void> => {
  await pool.query(
    `INSERT INTO route_expiry_notifications (route_id, stage, validity)
     SELECT due.route_id, $2, due.validity
       FROM unnest($1::varchar[], $3::date[]) AS due(route_id, validity)
     ON CONFLICT DO NOTHING`,
    [routes.map((route) => route.id), stage, routes.map((route) => route.validity)],
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

  const recipients = await loadRecipients();
  if (recipients.length === 0) {
    console.warn('⚠ No administrator has an email address — route validity alerts have nowhere to go');
    return;
  }

  let delivered = 0;

  for (const stage of EXPIRY_STAGES) {
    const routes = dueByStage.get(stage);
    if (!routes?.length) continue;
    const sent = await sendMail({
      to: recipients,
      subject: stageSubject(stage, routes.length),
      html: stageEmailHtml(stage, routes),
      text: stageEmailText(stage, routes),
    });
    if (!sent) continue;
    await recordSent(stage, routes);
    delivered += 1;
  }

  if (delivered > 0) {
    console.log(`✓ Route validity alerts sent (${delivered} email(s), ${recipients.length} recipient(s))`);
  }
};

export const startRouteExpiryNotifier = (): void => {
  if (!isMailConfigured()) {
    console.warn('⚠ Route validity alerts disabled — SMTP_HOST / MAIL_FROM are not set');
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
