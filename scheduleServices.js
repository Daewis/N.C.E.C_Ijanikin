import { pool } from './db.js';
import recurringServices from './recurringServices.js';

function getNextDateOfWeek(dayOfWeek) {
  // Debugging the input and internal logic of getNextDateOfWeek
  console.log(`[DEBUG - getNextDateOfWeek] Called with dayOfWeek: ${dayOfWeek}`);
  const today = new Date();
  console.log(`[DEBUG - getNextDateOfWeek] Internal 'today' date: ${today.toISOString()}`);

  const resultDate = new Date(today);
  if (isNaN(resultDate.getTime())) {
      console.error(`[DEBUG - getNextDateOfWeek] ERROR: resultDate is Invalid Date at function start.`);
      return null; // Return null to indicate failure
  }

  const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)

  let daysUntil;
  if (dayOfWeek <= currentDay) {
    daysUntil = (dayOfWeek - currentDay + 7);
  } else {
    daysUntil = (dayOfWeek - currentDay);
  }

  if (daysUntil === 0) {
      daysUntil = 7;
  }

  resultDate.setDate(today.getDate() + daysUntil);
  console.log(`[DEBUG - getNextDateOfWeek] Calculated resultDate before toISOString: ${resultDate.toISOString()}`);

  if (isNaN(resultDate.getTime())) {
      console.error(`[DEBUG - getNextDateOfWeek] ERROR: resultDate became Invalid Date before toISOString!`);
      return null;
  }

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

      const dbServiceDateRaw = result.rows[0].service_date; // Capture the raw value from DB
      console.log(`[DEBUG - updateServiceDates] Raw DB date for "${svc.service_name}":`, dbServiceDateRaw, `(Type: ${typeof dbServiceDateRaw})`);

      const currentServiceDate = new Date(dbServiceDateRaw); // Parse DB date

      // Check if currentServiceDate is a valid date
      if (isNaN(currentServiceDate.getTime())) {
          console.error(`[DEBUG - updateServiceDates] ERROR: currentServiceDate is Invalid Date for "${svc.service_name}" from DB value: "${dbServiceDateRaw}"! Skipping update.`);
          continue; // Skip this service if the date from the DB is invalid
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only update if current date has passed
      if (currentServiceDate < today) {
        console.log(`[DEBUG - updateServiceDates] "${svc.service_name}" (on ${currentServiceDate.toISOString().slice(0,10)}) is older than today, attempting to update.`);

        // Corrected call to getNextDateOfWeek based on its definition
        const newDate = getNextDateOfWeek(svc.day_of_week); // <-- ONLY PASS ONE ARGUMENT: svc.day_of_week

        if (newDate === null) { // Handle if getNextDateOfWeek returns null due to error
            console.error(`[DEBUG - updateServiceDates] Skipping update for "${svc.service_name}" due to invalid new date calculation.`);
            continue;
        }

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
        console.log(`[DEBUG - updateServiceDates] "${svc.service_name}" (on ${currentServiceDate.toISOString().slice(0,10)}) is already up to date.`);
      }

    } catch (err) {
      console.error(`Error updating "${svc.service_name}":`, err.message);
    }
  }
}