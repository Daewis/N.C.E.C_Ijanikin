/*import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Attendance_System',
    password: 'Abokunwa20',
    port: 5432, 
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows);
  }
});
export { pool };
**/




// db.js (or similar file where you set up your db connection)


const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // <-- This is crucial!
  ssl: {
    rejectUnauthorized: false // Render requires SSL, this setting helps with self-signed certs etc.
  }
});

// Optional: Basic error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit process if unhandled client error
});

console.log('PostgreSQL Pool initialized for Render.');

// If you have a connectDb function or similar, ensure it's using this pool
export async function connectDb() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected successfully!');
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error('Error connecting to PostgreSQL database:', err);
  }
}