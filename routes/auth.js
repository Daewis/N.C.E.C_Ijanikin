// === routes/auth.js ===
/*import express from 'express';
const router = express.Router();

router.get('/role', (req, res) => {
  if (req.session.superadmin) return res.json({ role: 'superadmin' });
  if (req.session.admin) return res.json({ role: 'admin' });
  res.status(401).json({ role: null });
});

export default router;
**/




// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

const router = express.Router();

// Admin & Superadmin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    req.session.user = {
      id: admin.admin_id,
      username: admin.username,
      role: admin.role // either 'admin' or 'superadmin'
    };

    res.status(200).json({ message: 'Login successful', role: admin.role, username: admin.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/admin-login.html');
});

// Role check (used by dashboard to determine visibility of admin registration)

router.get('/role', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Not authenticated' });
  res.json({ username: req.session.user.username, role: req.session.user.role });
});

/*router.get('/role', (req, res) => {
  if (req.session.superadmin) return res.json({ role: 'superadmin' });
  if (req.session.admin) return res.json({ role: 'admin' });
  res.status(401).json({ role: null });
});**/

export default router;
