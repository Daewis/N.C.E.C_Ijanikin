
import pg from 'pg';

const { Pool } = pg;

// This line needs to be 'export const'
export const pool = new Pool({ // <-- ADD 'export' here
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Optional: Basic error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
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