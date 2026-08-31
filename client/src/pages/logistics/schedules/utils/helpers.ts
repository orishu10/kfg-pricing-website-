import { EMPTY_SCHEDULE, SCHEDULE_KEYS, type ScheduleForm } from './consts';
import type { Schedule } from '../../../../api';

export const scheduleToForm = (s: Schedule): ScheduleForm => {
  const out = { ...EMPTY_SCHEDULE };
  SCHEDULE_KEYS.forEach((k) => {
    const v = (s as unknown as Record<string, unknown>)[k];
    out[k] = v == null ? '' : String(v);
  });
  out.etd = out.etd ? out.etd.slice(0, 10) : '';
  out.eta = out.eta ? out.eta.slice(0, 10) : '';
  return out;
};
