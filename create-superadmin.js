// create-superadmin.js
import bcrypt from 'bcrypt';
import { pool } from './db.js'; // Adjust path if needed

const username = 'David04';
const plainPassword = 'dae123'; // Change this before running

async function createSuperadmin() {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const existing = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      console.log('⚠️ Superadmin already exists.');
      return;
    }

    await pool.query(
      'INSERT INTO admins (username, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, 'superadmin']
    );

    console.log('✅ Superadmin created successfully.');
  } catch (err) {
    console.error('❌ Error creating superadmin:', err);
  } finally {
    pool.end();
  }
}

createSuperadmin();

