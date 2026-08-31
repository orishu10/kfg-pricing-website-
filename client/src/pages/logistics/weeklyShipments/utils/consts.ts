export const CONTAINER_OPTIONS = ['40FT/HC/DRY', '40FT/HC/REF', '20FT/DRY', '20FT/REF'];

export const SHIPMENT_KEYS = [
  'con', 'customer', 'supplier', 'description', 'pup', 'pol', 'pod',
  'vessel', 'voyage', 'etd', 'eta', 'booked',
] as const;

export type ShipmentForm = Record<(typeof SHIPMENT_KEYS)[number], string>;

export const EMPTY_SHIPMENT: ShipmentForm =
  Object.fromEntries(SHIPMENT_KEYS.map((k) => [k, ''])) as ShipmentForm;
