import './env.js';
import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import supabase from './supabase.js';
import { requireAdmin } from './middleware/requireAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, '../public')));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'kueo-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    project: 'kueo',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Waitlist signup
app.post('/waitlist', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400)
      .sendFile(join(__dirname, '../public/error.html'));
  }

  const { error } = await supabase
    .from('waitlist')
    .insert({ email });

  if (error) {
    if (error.code === '23505') {
      return res.sendFile(join(__dirname, '../public/already-registered.html'));
    }
    console.error('Waitlist insert error:', error);
    return res.status(500)
      .sendFile(join(__dirname, '../public/error.html'));
  }

  res.sendFile(join(__dirname, '../public/success.html'));
});

// Admin login page
app.get('/admin/login', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin');
  }
  
  const error = req.query.error;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kueo Admin — Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
</head>
<body>
    <main class="container">
        <header class="brand">
            <img src="/logo.png" alt="Kueo Clothings" class="brand-logo" />
            <p class="brand-tagline">Welcome Admin</p>
        </header>
        <section class="message">
            <h2 class="message-heading">Sign in</h2>
            ${error ? '<p style="color:#E87EA1;font-size:0.9rem;margin-top:0.5rem;">Incorrect username or password.</p>' : ''}
        </section>
        <section class="waitlist">
            <form class="waitlist-form" action="/admin/login" method="POST">
                <input type="text" name="username" class="waitlist-input" placeholder="Username" required />
                <input type="password" name="password" class="waitlist-input" placeholder="Password" required />
                <button type="submit" class="waitlist-button">Sign in</button>
            </form>
        </section>
    </main>
</body>
</html>`;

  res.send(html);
});

// Admin login submit
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }

  res.redirect('/admin/login?error=1');
});

// Admin dashboard
app.get('/admin', requireAdmin, async (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Dashboard fetch error:', error);
    return res.status(500).send('Failed to load dashboard');
  }

  const template = await readFile(
    join(__dirname, '../views/admin-dashboard.html'),
    'utf-8'
  );

  const rows = data.map((entry, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${entry.email}</td>
      <td>${new Date(entry.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}</td>
    </tr>
  `).join('');

  const html = template
    .replace('SIGNUP_COUNT', data.length)
    .replace('WAITLIST_ROWS', rows);

  res.send(html);
});

// Admin logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.redirect('/admin/login');
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Kueo server running on port ${PORT}`);
});