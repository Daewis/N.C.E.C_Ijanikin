import cron from 'node-cron';
import { pool } from './db.js';
import recurringServices from './recurringServices.js';

function getNextDateOfWeek(dayOfWeek) {
  const today = new Date();
  const resultDate = new Date(today);
  let daysUntil = (dayOfWeek - today.getDay() + 7) % 7;
  resultDate.setDate(today.getDate() + daysUntil);
  return resultDate.toISOString().slice(0, 10);
}

export async function updateServiceDates() {
  console.log("Running service date updater...");

  for (const svc of recurringServices) {
    try {
      // Get current service date from DB
      const result = await pool.query(
        'SELECT service_date FROM services WHERE service_name = $1 LIMIT 1',
        [svc.service_name]
      );

      if (result.rows.length === 0) {
        console.warn(`Service "${svc.service_name}" not found.`);
        continue;
      }

      const currentServiceDate = new Date(result.rows[0].service_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only update if current date has passed
      if (currentServiceDate < today) {
        const newDate = getNextDateOfWeek(today, svc.day_of_week);

        await pool.query(
          `UPDATE services
           SET service_date = $1,
               start_time = $2,
               end_time = $3,
               time_of_day = $4,
               service_location = $5
           WHERE service_name = $6`,
          [
            newDate,
            svc.start_time,
            svc.end_time,
            svc.time_of_day,
            svc.service_location,
            svc.service_name
          ]
        );

        console.log(`Updated "${svc.service_name}" to ${newDate}`);
      } else {
        console.log(`"${svc.service_name}" is already up to date.`);
      }

    } catch (err) {
      console.error(`Error updating "${svc.service_name}":`, err.message);
    }
  }
}


// Schedule job to run at 12:01 AM every Sunday (weekly)
/* cron.schedule('1 0 * 7 0', async () => {
  console.log('Running weekly service date update...');
  await updateServiceDates();
}, {
  timezone: "Africa/Lagos" // Or your local timezone
});*/
