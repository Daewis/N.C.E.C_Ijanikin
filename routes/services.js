import express from 'express';
import { pool } from '../db.js';
import { updateServiceDates } from '../scheduleServices.js';

const router = express.Router();

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Please log in' });
}

// Get all services (for dropdown)
router.get('/', requireLogin, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY service_date DESC, start_time ASC');
    // Format service_date to 'YYYY-MM-DD' (remove time part if present)
    const formattedRows = result.rows.map(row => ({
      ...row,
      service_date: row.service_date instanceof Date
        ? row.service_date.toISOString().slice(0, 10)
        : row.service_date
    }));
    res.json(formattedRows);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ message: 'Could not fetch services' });
  }
});

router.post('/add', async (req, res) => {
  const { service_name, service_location, start_time, end_time, time_of_day, service_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO services (service_name, service_location, start_time, end_time, time_of_day, service_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [service_name, service_location, start_time, end_time, time_of_day, service_date]
    );
    // Format service_date in the response as well
    const service = result.rows[0];
    service.service_date = service.service_date instanceof Date
      ? service.service_date.toISOString().slice(0, 10)
      : service.service_date;
    res.status(201).json({ message: 'Service added', service });
  } catch (err) {
    console.error('Add service error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;