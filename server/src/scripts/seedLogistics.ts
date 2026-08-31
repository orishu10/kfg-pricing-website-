import { pool } from '../db';

const SHIPMENTS: (string | boolean)[][] = [
  ['40FT/HC/DRY', 'Bertram', 'Fogel, Einat, Berman', 'Jams, Bread and Baked', 'Ashdod', 'Ashdod', 'New York', 'MSC Qingdao', 'IU117A', '2026-08-31', '2026-09-14', true],
  ['40FT/HC/DRY', 'Bertram', 'Besler', 'Pasta', 'Ashdod', 'Haifa', 'New York', 'MSC Lorena', 'MD118R', '2026-09-01', '2026-09-11', true],
  ['40FT/HC/REF', 'Hatov', 'Strauss', 'Ice Cream', 'Ashdod', 'Haifa', 'Felixtowe', 'ZIM Europe', '61W', '2026-09-02', '2026-09-16', false],
  ['40FT/HC/DRY', 'Kemach', 'EH', 'Bread and Baked', 'Haifa', 'Haifa', 'New York', 'Cosco Trouper', '117W', '2026-09-04', '2026-09-14', true],
];

const SCHEDULES: string[][] = [
  ['MSC Paris', 'IU129A', 'Ashdod', 'New York', '2026-08-31', '2026-09-14', '40 DAYS Trans', '31-Aug-21 12:00AM', '31-Aug-21 12:00AM', '31-Aug-21 12:00AM'],
  ['MSC Valencia', 'IU130A', 'Haifa', 'New York', '2026-09-01', '2026-09-11', '10 DAYS Direct', '01-Sep-21 13:00AM', '01-Sep-21 13:00AM', '01-Sep-21 13:00AM'],
  ['ZIM Luanda', '88E', 'Haifa', 'Felixtowe', '2026-09-02', '2026-09-16', '14 DAYS Direct', '02-Sep-21 20:00PM', '02-Sep-21 20:00PM', '02-Sep-21 20:00PM'],
  ['Cosco America', '072S', 'Haifa', 'Felixtowe', '2026-09-04', '2026-09-16', '12 DAYS Direct', '04-Sep-21 20:00PM', '04-Sep-21 20:00PM', '04-Sep-21 20:00PM'],
];

const run = async () => {
  const ship = await pool.query('SELECT COUNT(*)::int AS c FROM weekly_shipments');
  if (ship.rows[0].c > 0) {
    console.log(`• weekly_shipments already has ${ship.rows[0].c} row(s) — skipping`);
  } else {
    for (const r of SHIPMENTS) {
      await pool.query(
        `INSERT INTO weekly_shipments
           (con, customer, supplier, description, pup, pol, pod, vessel, voyage, etd, eta, booked, created_by, updated_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'seed','seed')`,
        r,
      );
    }
    console.log(`✓ Inserted ${SHIPMENTS.length} weekly_shipments`);
  }

  const sched = await pool.query('SELECT COUNT(*)::int AS c FROM schedules');
  if (sched.rows[0].c > 0) {
    console.log(`• schedules already has ${sched.rows[0].c} row(s) — skipping`);
  } else {
    for (const r of SCHEDULES) {
      await pool.query(
        `INSERT INTO schedules
           (vessel, voyage, pol, pod, etd, eta, tt, ddl_con, ddl_docs, ddl_port, created_by, updated_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'seed','seed')`,
        r,
      );
    }
    console.log(`✓ Inserted ${SCHEDULES.length} schedules`);
  }

  await pool.end();
};

run().catch((err) => {
  console.error('✗ Failed to seed logistics:', err);
  process.exit(1);
});
