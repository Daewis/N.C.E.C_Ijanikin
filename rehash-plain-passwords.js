import bcrypt from 'bcrypt';
import { pool } from './db.js'; // adjust path if needed

async function rehashPlainPasswords() {
  try {
    // 1. Get all members
    const res = await pool.query('SELECT member_id, username, password FROM members');

    for (const member of res.rows) {
      const { member_id, username, password } = member;

      // 2. Skip already-hashed passwords
      if (password.startsWith('$2b$')) {
        console.log(`✅ Already hashed: ${username}`);
        continue;
      }

      // 3. Hash the plain-text password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Update the DB
      await pool.query(
        'UPDATE members SET password = $1 WHERE member_id = $2',
        [hashedPassword, member_id]
      );

      console.log(`🔒 Rehashed password for user: ${username}`);
    }

    console.log('✅ Password rehashing complete.');
  } catch (err) {
    console.error('❌ Error during rehashing:', err);
  } finally {
    pool.end(); // Close DB connection
  }
}

rehashPlainPasswords();