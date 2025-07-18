/*import express from 'express';
import { pool } from '../db.js';
//import bcrypt from 'bcrypt';

const router = express.Router();

// Middleware to restrict to superadmin
function requireSuperAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Superadmin only.' });
  }
}

// Admin login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM admin WHERE username = $1', [username]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session after successful login
    req.session.user = {
      id: admin.admin_id,
      username: admin.username,
      role: admin.role,
    };

    return res.status(200).json({ message: 'Login successful', username: admin.username });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// Register new admin
/*router.post('/register', requireSuperAdmin, async (req, res) => {
  const { username, password, full_name, email, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admins (username, password, full_name, email, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [username, hashedPassword, full_name, email, role || 'admin']
    );

    res.status(201).json({ message: 'Admin registered successfully', admin: result.rows[0] });
  } catch (err) {
    console.error('Error registering admin:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});**/


/*
// Fetch current session user
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;**/








// routes/admin.js
import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

// Middleware to check if user is an admin or superadmin
function isAdminOrSuper(req, res, next) {
  if (['admin', 'superadmin'].includes(req.session.user?.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}

// Get all members
router.get('/members', isAuthenticated, isAdminOrSuper, async (req, res) => {
  try {
    const result = await pool.query('SELECT member_id, username, email, gender, phone_number FROM members');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance records for a specific date
router.get('/attendance/:date', isAuthenticated, isAdminOrSuper, async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      `SELECT a.attendance_id, m.username, s.service_name, s.service_date, a.timestamp
       FROM attendance a
       JOIN members m ON a.member_id = m.member_id
       JOIN services s ON a.service_id = s.service_id
       WHERE DATE(s.service_date) = $1`,
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// (Optional) Admin fetch services
router.get('/services', isAuthenticated, isAdminOrSuper, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY service_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



