import { pool } from './db.js';
import recurringServices from './recurringServices.js';

function getNextDateOfWeek(dayOfWeek) {
  const today = new Date();
  const resultDate = new Date(today);
  let daysUntil = (dayOfWeek - today.getDay() + 7) % 7;
  // If today is the target day, use today (not next week)
  resultDate.setDate(today.getDate() + daysUntil);
  return resultDate.toISOString().slice(0, 10);
}

async function updateServiceDates() {
  for (const svc of recurringServices) {
    const service_date = getNextDateOfWeek(svc.day_of_week);
    try {
      await pool.query(
        `UPDATE services
         SET service_date = $1,
             start_time = $2,
             end_time = $3,
             time_of_day = $4,
             service_location = $5
         WHERE service_name = $6`,
        [
          service_date,
          svc.start_time,
          svc.end_time,
          svc.time_of_day,
          svc.service_location,
          svc.service_name
        ]
      );
      console.log(`Updated: ${svc.service_name} to ${service_date}`);
    } catch (err) {
      console.error(`Error updating ${svc.service_name}:`, err.message);
    }
  }
  await pool.end();
}

updateServiceDates();