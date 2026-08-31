export const SCHEDULE_KEYS = [
  'vessel', 'voyage', 'pol', 'pod', 'etd', 'eta', 'tt',
  'ddl_con', 'ddl_docs', 'ddl_port',
] as const;

export type ScheduleForm = Record<(typeof SCHEDULE_KEYS)[number], string>;

export const EMPTY_SCHEDULE: ScheduleForm =
  Object.fromEntries(SCHEDULE_KEYS.map((k) => [k, ''])) as ScheduleForm;
