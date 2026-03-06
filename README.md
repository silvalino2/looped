# Looped v2

Automated video clipping tool — upload long-form videos, get short-form clips with burned-in captions.

## Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Video**: FFmpeg (via fluent-ffmpeg)
- **Auth**: JWT
- **Hosting**: DigitalOcean

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- FFmpeg installed on your system

**Install FFmpeg:**
```bash
# macOS
brew install ffmpeg

# Ubuntu / DigitalOcean Droplet
sudo apt update && sudo apt install ffmpeg -y
```

### 1. Clone and install
```bash
git clone <your-repo>
cd looped-v2
npm run install:all
```

### 2. Configure environment
```bash
cd server
cp .env.example .env
# Edit .env with your values
```

**Minimum required in `.env`:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/looped
JWT_SECRET=some_long_random_string_at_least_32_chars
```

### 3. Create the database
```bash
psql -U postgres -c "CREATE DATABASE looped;"
```
The schema is auto-created on server start.

### 4. Run in development
```bash
# From root — runs both frontend and backend
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API: http://localhost:5000/api

---

## Project Structure

```
looped-v2/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # All page components
│   │   ├── components/
│   │   │   ├── ui/         # Reusable UI (Button, Input, Logo)
│   │   │   └── layout/     # AppLayout with sidebar
│   │   ├── context/        # AuthContext
│   │   └── lib/            # Axios instance
│   └── vite.config.js
│
└── server/                 # Node/Express backend
    ├── routes/
    │   ├── auth.js         # Register, login, profile
    │   ├── jobs.js         # Upload, status, clips
    │   └── admin.js        # Admin panel APIs
    ├── controllers/
    │   └── processor.js    # FFmpeg video pipeline
    ├── middleware/
    │   └── auth.js         # JWT middleware
    ├── db/
    │   └── index.js        # PostgreSQL + schema
    └── server.js           # Entry point
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page (public) |
| `/register` | Sign up |
| `/login` | Log in |
| `/dashboard` | User home — stats + recent videos |
| `/upload` | Upload + process a video |
| `/history` | All past jobs |
| `/clips/:jobId` | View + download clips for a job |
| `/settings` | Profile settings |
| `/admin` | Admin dashboard (admin role only) |

---

## DigitalOcean Deployment

### Option A — App Platform (easiest)
1. Push to GitHub
2. Create new App in DO App Platform
3. Add PostgreSQL managed database
4. Set environment variables
5. Deploy

### Option B — Droplet (more control)
```bash
# On your droplet (Ubuntu 22)
sudo apt update && sudo apt install -y nodejs npm postgresql ffmpeg nginx

# Clone repo, install, build
git clone <repo> && cd looped-v2
npm run install:all
cd client && npm run build

# Set NODE_ENV=production in server/.env
# Start with PM2
npm install -g pm2
cd server && pm2 start server.js --name looped
pm2 save && pm2 startup
```

### Nginx config (reverse proxy)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        client_max_body_size 2G;
    }
}
```

---

## Upgrading Transcription

The current processor uses FFmpeg for clipping with placeholder captions.
To add real speech-to-text, swap `processor.js` step 3:

**Option 1 — OpenAI Whisper API** (easiest)
```js
const OpenAI = require('openai')
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream(audioPath),
  model: 'whisper-1'
})
```

**Option 2 — AssemblyAI** (free tier available)

**Option 3 — Local Whisper** (self-hosted, free forever)
```bash
pip install openai-whisper
whisper audio.mp3 --model base
```

---

## First Admin Account

The first user to register automatically gets admin role.
You can also set `ADMIN_EMAIL` in `.env` to make a specific email always admin.
