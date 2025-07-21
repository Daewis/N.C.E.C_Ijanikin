import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import {pool} from './db.js';
import membersRoute from './routes/members.js';
import attendanceRoute from './routes/attendance.js'; 
import servicesRoute from './routes/services.js';
import superadminRoutes from './routes/superadmin.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';  
import cors from 'cors';
import './cronScheduler.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());



const PgSession = pgSession(session);

app.use(session({
  store: new PgSession({
    pool: pool,              // Reuse your PostgreSQL connection
    tableName: 'user_sessions',
  }),
  secret: 'Abokunwa20', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));


// Use routes
app.use('/members', membersRoute);
app.use('/attendance', attendanceRoute);
app.use('/services', servicesRoute);
app.use('/superadmin', superadminRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);


app.get('/dashboard.html', (req, res) => {
  if (!req.session.superadmin && !req.session.admin) return res.redirect('/admin_login.html');
  res.sendFile(path.join(process.cwd(), 'public', 'dashboard.html'));
});


//login route
/*app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query the database to check if the username exists
    const user = await pool.query('SELECT member_id, username  FROM members WHERE username = $1 AND password = $2', 
      [username, password]);

    if (user.rows.length > 0) {
      // If the user exists, return a success response
      req.session.user = {
        member_id: user.rows[0].member_id,
        username: user.rows[0].username,
        role: 'member'
      };

      console.log('User stored in session:', req.session.user); // should show { member_id, username }

      return res.status(200).json({ message: 'Login successful', username: user.rows[0].username });
    } else {
      // If the user does not exist, return an error response
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
);**/




// Sample route
/*app.get('/members', async(req, res) => {
  try {
    const members = await pool.query("select distinct last_name from members where last_name like 'A%'");
    if (members.rows.length === 0) {
      return res.status(404).send('No members found');
    }
    res.json(members.rows)
} catch (err) {
    console.error(err);
    res.status(500).send('Server error');
}
});
--alter table members add column password text not null;
select * from members ;
app.get('/attendance', async(req, res) => {
  try {
    const members = await pool.query("select * from attendance");
    if (members.rows.length === 0) {
      return res.status(404).send('No attendance found');
    }
    res.json(members.rows)
} catch (err) {
    console.error(err);
    res.status(500).send('Server error');
}
});**/

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});


app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});