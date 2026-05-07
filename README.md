# Kueo Clothing

Pre-launch website for Kueo — a modern children's clothing brand.

## Tech Stack

- Node.js + Express
- Supabase (PostgreSQL)
- Vanilla HTML + CSS

## Project Structure
kueo/
├── server/
│   ├── src/
│   │   ├── env.js          # dotenv loader
│   │   ├── supabase.js     # Supabase client
│   │   └── index.js        # Express server
│   ├── public/
│   │   ├── index.html      # Landing page
│   │   ├── styles.css      # Styles
│   │   ├── success.html    # Waitlist confirmation
│   │   ├── already-registered.html
│   │   └── error.html
│   ├── .env                # Local environment variables (never commit)
│   └── package.json
└── README.md
## Getting Started

1. Clone the repository
2. Create `server/.env` with the following:
NODE_ENV=development
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
3. Install dependencies and start the server:

```bash
cd server
npm install
npm run dev
```

4. Visit `http://localhost:3000`
