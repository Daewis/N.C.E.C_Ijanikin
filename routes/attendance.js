import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Unauthorized: Login required' });
  }
  next();
}

// Mark attendance
router.post('/mark', requireLogin, async (req, res) => {
  const memberId = req.session.user?.member_id;
  const { service_id, service_location, specific_time, service_name, time_of_day, service_date } = req.body;

  try {
    // Check if this member has already registered for this service (by service_id and service_date)
    const check = await pool.query(
      `SELECT 1 FROM attendance WHERE member_id = $1 AND service_id = $2 AND attendance_date = $3`,
      [memberId, service_id, service_date]
    );
    if (check.rows.length > 0) {
      return res.status(409).json({ message: 'You have already registered for this service.' });
    }

    const result = await pool.query(
      `INSERT INTO attendance (member_id, service_id, service_location, specific_time, service_name, time_of_day, attendance_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [memberId, service_id, service_location, specific_time, service_name, time_of_day, service_date]
    );

    res.status(201).json({ message: 'Attendance marked successfully', attendance: result.rows[0] });
  } catch (err) {
    console.error('Error inserting attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', async (_req, res) => {
  try {
    const attendance = await pool.query(`SELECT * FROM attendance`);
    res.json(attendance.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error loading attendance' });
  }
});

// Get attendance by member name
/*router.get('/', async (req, res) => {
  const { first_name, last_name } = req.query;

  if (!first_name || !last_name) {
    return res.status(400).json({ message: 'First and last name required' });
  }

  try {
    const result = await pool.query(
      `SELECT m.first_name, m.last_name, s.service_name, s.service_location, s.time_of_day, s.start_time, s.end_time, a.attendance_date
       FROM attendance a
       JOIN members m ON m.id = a.member_id
       JOIN services s ON s.id = a.service_id
       WHERE m.first_name = $1 AND m.last_name = $2`,
      [first_name, last_name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});*/

export default router;