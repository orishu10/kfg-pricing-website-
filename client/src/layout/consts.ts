import type { AccessRequirement } from '../context/auth';

export interface NavItem {
  label: string;
  path: string;
  ready?: boolean;
}

export interface NavModule extends NavItem {
  requires: AccessRequirement;
  children: NavItem[];
}

export const DISMISSED_ALERTS_STORAGE_KEY = 'kfg_dismissed_route_alerts';

export const MODULES: NavModule[] = [
  {
    label: 'DBM',
    path: '/dbm',
    requires: 'dbm',
    ready: true,
    children: [
      { label: 'Customers', path: '/customers', ready: true },
      { label: 'Suppliers', path: '/suppliers', ready: true },
      { label: 'Items', path: '/items', ready: true },
      { label: 'Incoterms', path: '/incoterms', ready: true },
      { label: 'Currencies', path: '/currencies', ready: true },
      { label: 'Countries', path: '/countries', ready: true },
      { label: 'Containers', path: '/containers', ready: true },
      { label: 'Shipping Lines', path: '/shipping-lines', ready: true },
      { label: 'Sea Ports', path: '/sea-ports', ready: true },
    ],
  },
  { label: 'Pricing', path: '/pricing', requires: 'pricing', ready: true, children: [] },
  {
    label: 'Logistics',
    path: '/logistics',
    requires: 'logistics',
    ready: true,
    children: [
      { label: 'Weekly Shipments', path: '/logistics/weekly-shipments', ready: true },
      { label: 'Schedules', path: '/logistics/schedules', ready: true },
      { label: 'Routes', path: '/logistics/routes', ready: true },
      { label: 'Shipment History', path: '/logistics/shipment-history' },
      { label: 'Weekly Expenses', path: '/logistics/weekly-expenses' },
      { label: 'Insurance', path: '/logistics/insurance' },
    ],
  },
  { label: 'Reports', path: '/reports', requires: 'reports', children: [] },
  { label: 'Users', path: '/users', requires: 'admin', ready: true, children: [] },
  { label: 'Formats', path: '/formats', requires: 'admin', ready: true, children: [] },
];
