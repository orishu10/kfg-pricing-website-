export type ExpiryStage = 'week' | 'day' | 'expired';

export interface ExpiringRoute {
  id: string;
  reference: string | null;
  agent: string | null;
  shipping_line: string | null;
  origin: string | null;
  destination: string | null;
  origin_port: string | null;
  destination_port: string | null;
  validity: string;
  days_left: number;
}

export const EXPIRY_STAGES: ExpiryStage[] = ['expired', 'day', 'week'];

export const stageForDaysLeft = (daysLeft: number): ExpiryStage =>
  daysLeft < 0 ? 'expired' : daysLeft <= 1 ? 'day' : 'week';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const joinParts = (parts: (string | null)[], separator: string): string =>
  parts.filter((part) => part && part.trim()).join(separator);

const routeLane = (route: ExpiringRoute): string =>
  joinParts([joinParts([route.origin, route.origin_port], ' / '), joinParts([route.destination, route.destination_port], ' / ')], ' → ');

const routeTitle = (route: ExpiringRoute): string => `Route ${route.id}`;

const routeCarrier = (route: ExpiringRoute): string => joinParts([route.agent, route.shipping_line], ' · ');

const appBaseUrl = (): string => process.env.APP_URL?.trim().replace(/\/+$/, '') ?? '';

const routeUrl = (id: string): string => {
  const base = appBaseUrl();
  return base ? `${base}/logistics/routes/${encodeURIComponent(id)}` : '';
};

const cell = (content: string, extra = ''): string =>
  `<td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#222;${extra}">${content}</td>`;

const headerCell = (label: string): string =>
  `<th align="left" style="padding:8px 12px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#666;border-bottom:2px solid #c41230;">${label}</th>`;

const routeTitleHtml = (route: ExpiringRoute): string => {
  const title = escapeHtml(routeTitle(route));
  const url = routeUrl(route.id);
  return url
    ? `<a href="${escapeHtml(url)}" style="color:#c41230;font-weight:bold;text-decoration:underline;">${title}</a>`
    : `<strong>${title}</strong>`;
};

export const routeEmailSubject = (route: ExpiringRoute): string =>
  `Route Validity Alert - #${route.id}`;

export const routeEmailHtml = (route: ExpiringRoute): string => {
  const lane = routeLane(route);
  const carrier = routeCarrier(route);
  const url = routeUrl(route.id);
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#ffffff;padding:24px;">
  <table cellspacing="0" cellpadding="0" style="width:100%;max-width:720px;border-collapse:collapse;">
    <thead><tr>${headerCell('Route')}${headerCell('Lane')}${headerCell('Validity')}</tr></thead>
    <tbody><tr>${cell(
      `${routeTitleHtml(route)}${carrier ? `<div style="color:#666;font-size:12px;margin-top:2px;">${escapeHtml(carrier)}</div>` : ''}`,
    )}${cell(lane ? escapeHtml(lane) : '—')}${cell(escapeHtml(route.validity), 'white-space:nowrap;')}</tr></tbody>
  </table>
  ${url ? `<div style="margin-top:14px;"><a href="${escapeHtml(url)}" style="color:#c41230;font-weight:bold;font-size:13px;text-decoration:none;">Open Route</a></div>` : ''}
</div>`;
};

export const routeEmailText = (route: ExpiringRoute): string =>
  [
    routeTitle(route),
    routeCarrier(route),
    routeLane(route),
    `Validity ${route.validity}`,
    routeUrl(route.id),
  ]
    .filter((line) => line)
    .join('\n');
