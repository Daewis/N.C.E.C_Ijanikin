import express from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcrypt';


const router = express.Router();

// Route to fetch all members
router.get('/', async (_req, res) => {
  try {
    const members = await pool.query('SELECT * FROM members');
    res.status(200).json(members.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route to register a new member
router.post('/register', async (req, res) => {
  const { first_name, last_name, username, password, date_of_birth, email, address, membership_date, gender, phone_number } = req.body;

  if (!first_name || !last_name || !username || !password || !date_of_birth || !email || !address || !membership_date || !gender || !phone_number) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const existingUser = await pool.query('SELECT * FROM members WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const result = await pool.query(
      'INSERT INTO members (first_name, last_name, username, password, date_of_birth, email, address, membership_date, gender, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [first_name, last_name, username, hashedPassword, date_of_birth, email, address, membership_date, gender, phone_number]
    );
    res.status(201).json({ message: 'Member registered successfully', member: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// routes/members.js
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT member_id, username, password FROM members WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result.rows[0];

   if (!user.password.startsWith('$2b$')) {
      return res.status(403).json({ message: 'password not securely' });
    }
    

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    req.session.user = {
      member_id: user.member_id,
      username: user.username,
      role: 'member'
    };

    console.log('User stored in session:', req.session.user);

    return res.status(200).json({ message: 'Login successful', username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- New route for searching members (PostgreSQL version) ---
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query; // Get the search query from the URL
        if (!query) {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        // Use ILIKE for case-insensitive pattern matching in PostgreSQL
        // % is a wildcard character
        const searchQuery = `%${query}%`;

        // SQL query to search across multiple fields
        // Be careful with SQL injection! Using parameterized queries is crucial.
        const sqlQuery = `
            SELECT * FROM members
            WHERE
                first_name ILIKE $1 OR
                last_name ILIKE $1 OR
                username ILIKE $1 OR
                email ILIKE $1 OR
                phone_number ILIKE $1
            LIMIT 50; -- Limit results for performance
        `;

        const { rows } = await pool.query(sqlQuery, [searchQuery]);

        res.status(200).json(rows); // Send the found members back as JSON
    } catch (error) {
        console.error('Error searching members:', error);
        res.status(500).json({ message: 'Internal server error during search.' });
    }
});

// --- NEW ROUTE: UPDATE MEMBER DETAILS (PUT /members/:id) ---
router.put('/:id', async (req, res) => {
    const memberId = req.params.id; // Get ID from URL parameter
    const { first_name, last_name, email, phone_number } = req.body; // Get updated data from request body

    // Basic validation
    if (!first_name || !last_name) { // Assuming these are mandatory
        return res.status(400).json({ message: 'First name and Last name are required.' });
    }

    try {
        const result = await pool.query(
            `UPDATE members
             SET
                 first_name = $1,
                 last_name = $2,
                 email = $3,
                 phone_number = $4
             WHERE
                 member_id = $5
             RETURNING *;`, // RETURNING * to get the updated row
            [first_name, last_name, email, phone_number, memberId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Member not found.' });
        }

        res.status(200).json({ message: 'Member updated successfully!', member: result.rows[0] });
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ message: 'Failed to update member due to server error.' });
    }
});

// --- NEW ROUTE: RESET MEMBER PASSWORD (PUT /members/:id/reset-password) ---
router.put('/:id/reset-password', async (req, res) => {
    const memberId = req.params.id; // Get member ID from URL parameter
    const { newPassword } = req.body; // Get new password from request body

    // Basic validation for new password
    if (!newPassword || newPassword.length < 6) { // Example: password must be at least 6 chars
        return res.status(400).json({ message: 'New password is required and must be at least 6 characters long.' });
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the member's password in the database
        const result = await pool.query(
            `UPDATE members
             SET
                 password = $1
             WHERE
                 member_id = $2
             RETURNING member_id;`, // Only return member_id for confirmation
            [hashedPassword, memberId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Member not found.' });
        }

        res.status(200).json({ message: 'Member password reset successfully!' });
    } catch (error) {
        console.error('Error resetting member password:', error);
        res.status(500).json({ message: 'Failed to reset password due to server error.' });
    }
});



export default router;