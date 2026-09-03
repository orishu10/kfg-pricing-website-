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

interface StagePresentation {
  subject: (count: number) => string;
  heading: string;
  color: string;
}

export const EXPIRY_STAGES: ExpiryStage[] = ['expired', 'day', 'week'];

const STAGE_PRESENTATION: Record<ExpiryStage, StagePresentation> = {
  week: {
    subject: (count) => `Route validity: ${count} route${count === 1 ? '' : 's'} expiring in a week`,
    heading: 'Expiring within a week',
    color: '#8a6d00',
  },
  day: {
    subject: (count) => `Route validity: ${count} route${count === 1 ? '' : 's'} expiring within a day`,
    heading: 'Expiring within a day',
    color: '#ed6c02',
  },
  expired: {
    subject: (count) => `Route validity: ${count} route${count === 1 ? '' : 's'} expired`,
    heading: 'Expired',
    color: '#d32f2f',
  },
};

export const stageForDaysLeft = (daysLeft: number): ExpiryStage =>
  daysLeft < 0 ? 'expired' : daysLeft <= 1 ? 'day' : 'week';

export const expiryMessage = (daysLeft: number): string => {
  if (daysLeft < -1) return `Expired ${Math.abs(daysLeft)} days ago`;
  if (daysLeft === -1) return 'Expired yesterday';
  if (daysLeft === 0) return 'Expires today';
  if (daysLeft === 1) return 'Expires tomorrow';
  return `Expires in ${daysLeft} days`;
};

export const stageSubject = (stage: ExpiryStage, count: number): string =>
  STAGE_PRESENTATION[stage].subject(count);

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

const routeTitle = (route: ExpiringRoute): string =>
  joinParts([`Route ${route.id}`, route.reference], ' · ');

const routeCarrier = (route: ExpiringRoute): string => joinParts([route.agent, route.shipping_line], ' · ');

const appBaseUrl = (): string => process.env.APP_URL?.trim().replace(/\/+$/, '') ?? '';

const routesUrl = (): string => {
  const base = appBaseUrl();
  return base ? `${base}/logistics/routes` : '';
};

const routeUrl = (id: string): string => {
  const base = appBaseUrl();
  return base ? `${base}/logistics/routes/${encodeURIComponent(id)}` : '';
};

const cell = (content: string, extra = ''): string =>
  `<td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#222;${extra}">${content}</td>`;

const routeTitleHtml = (route: ExpiringRoute): string => {
  const title = escapeHtml(routeTitle(route));
  const url = routeUrl(route.id);
  return url
    ? `<a href="${escapeHtml(url)}" style="color:#c41230;font-weight:bold;text-decoration:underline;">${title}</a>`
    : `<strong>${title}</strong>`;
};

const rowHtml = (route: ExpiringRoute): string => {
  const lane = routeLane(route);
  const carrier = routeCarrier(route);
  return `<tr>${cell(
    `${routeTitleHtml(route)}${carrier ? `<div style="color:#666;font-size:12px;margin-top:2px;">${escapeHtml(carrier)}</div>` : ''}`,
  )}${cell(lane ? escapeHtml(lane) : '—')}${cell(escapeHtml(route.validity), 'white-space:nowrap;')}${cell(
    escapeHtml(expiryMessage(route.days_left)),
    'white-space:nowrap;',
  )}</tr>`;
};

const headerCell = (label: string): string =>
  `<th align="left" style="padding:8px 12px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#666;border-bottom:2px solid #c41230;">${label}</th>`;

export const stageEmailHtml = (stage: ExpiryStage, routes: ExpiringRoute[]): string => {
  const { heading, color } = STAGE_PRESENTATION[stage];
  const link = routesUrl();
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;padding:24px;">
  <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:6px;overflow:hidden;">
    <div style="background:#c41230;color:#ffffff;padding:16px 20px;font-size:16px;font-weight:bold;">KFG · Route validity alert</div>
    <div style="padding:20px;">
      <div style="font-size:15px;font-weight:bold;color:${color};margin-bottom:4px;">${heading}</div>
      <div style="font-size:13px;color:#555;margin-bottom:16px;">${routes.length} route${routes.length === 1 ? '' : 's'} require attention.</div>
      <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
        <thead><tr>${headerCell('Route')}${headerCell('Lane')}${headerCell('Validity')}${headerCell('Status')}</tr></thead>
        <tbody>${routes.map(rowHtml).join('')}</tbody>
      </table>
      ${link ? `<div style="margin-top:20px;"><a href="${escapeHtml(link)}" style="background:#c41230;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:4px;font-size:13px;display:inline-block;">Open routes</a></div>` : ''}
    </div>
  </div>
</div>`;
};

export const stageEmailText = (stage: ExpiryStage, routes: ExpiringRoute[]): string => {
  const link = routesUrl();
  const lines = routes.map((route) =>
    joinParts(
      [
        routeTitle(route),
        routeLane(route) || null,
        `validity ${route.validity}`,
        expiryMessage(route.days_left),
        routeUrl(route.id) || null,
      ],
      ' | ',
    ),
  );
  return [STAGE_PRESENTATION[stage].heading, '', ...lines, ...(link ? ['', link] : [])].join('\n');
};
