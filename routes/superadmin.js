/*import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

const router = express.Router();

// Superadmin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM superadmin WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid username or password' });

    const superadmin = result.rows[0];
    const isMatch = await bcrypt.compare(password, superadmin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });

    req.session.superadmin = { id: superadmin.id, username: superadmin.username };
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Superadmin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register Admin (Only Superadmin)
router.post('/register-admin', async (req, res) => {
  if (!req.session.superadmin) return res.status(403).json({ message: 'Access denied: Superadmin only' });

  const { username, password } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM admin WHERE username = $1', [username]);
    if (existing.rows.length > 0) return res.status(409).json({ message: 'Admin already exists' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO admin (username, password) VALUES ($1, $2)', [username, hashed]);

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List all admins
router.get('/list', requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT admin_id, username, full_name, role FROM admins ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ message: 'Server error fetching admins' });
  }
});


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

export default router;
**/





// routes/superadmin.js
import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

const router = express.Router();

// Middleware to check if current user is a superadmin
function verifySuperadmin(req, res, next) {
  if (req.session?.user?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Superadmin only.' });
  }
  next();
}

// Superadmin registers a new admin
router.post('/register-admin', verifySuperadmin, async (req, res) => {
  const { username, password } = req.body;

  // Validate inputs
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check for existing username
    const existing = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Insert admin with role = 'admin'
     await pool.query(
      'INSERT INTO admins (username, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, 'admin']
    );
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
