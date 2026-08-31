import { EMPTY_SHIPMENT, SHIPMENT_KEYS, type ShipmentForm } from './consts';
import type { WeeklyShipment, WeeklyShipmentInput } from '../../../../api';

export const shipmentToForm = (s: WeeklyShipment): ShipmentForm => {
  const out = { ...EMPTY_SHIPMENT };
  SHIPMENT_KEYS.forEach((k) => {
    const v = (s as unknown as Record<string, unknown>)[k];
    out[k] = v == null ? '' : String(v);
  });
  out.etd = out.etd ? out.etd.slice(0, 10) : '';
  out.eta = out.eta ? out.eta.slice(0, 10) : '';
  out.booked = s.booked ? 'true' : '';
  return out;
};

export const formToInput = (f: ShipmentForm): WeeklyShipmentInput => ({
  ...f,
  booked: f.booked === 'true',
});
