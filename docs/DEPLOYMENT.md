# HostelBird Build & Break — Deployment Guide

## Architecture

```
GitHub repo
    │
    ├── frontend/  ──→  Vercel  (hostelbird-build-break.vercel.app)
    │
    └── backend/   ──→  Render  (hostelbird-api.onrender.com)
```

Frontend calls `/api/*` → proxied in dev, hits Render directly in production.

---

## Part 1 — Deploy Backend to Render

### Step 1 — Create a Render account
Go to https://render.com and sign up (free tier is sufficient).

### Step 2 — New Web Service
1. Click **New → Web Service**
2. Connect your GitHub account
3. Select the repo: `Aswini3112/hostelbird`
4. Fill in the settings:

| Setting | Value |
|---------|-------|
| **Name** | `hostelbird-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### Step 3 — Add Environment Variables
In Render dashboard → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `ALLOWED_ORIGINS` | *(leave blank for now — fill after Vercel deploy)* |

### Step 4 — Deploy
Click **Create Web Service**. Render will:
1. Clone your repo
2. Run `npm install && npm run build` (compiles TypeScript)
3. Run `npm start` (runs `node dist/index.js`)

Wait ~2 minutes. Once live, visit:
```
https://hostelbird-api.onrender.com/health
```
You should see:
```json
{"status":"ok","service":"HostelBird Build & Break API","version":"1.0.0"}
```

### Step 5 — Note your Render URL
Copy the URL — you'll need it for Vercel: `https://hostelbird-api.onrender.com`

---

## Part 2 — Deploy Frontend to Vercel

### Step 1 — Create a Vercel account
Go to https://vercel.com and sign up (free tier is sufficient).

### Step 2 — Import Project
1. Click **Add New → Project**
2. Import from GitHub: `Aswini3112/hostelbird`
3. Fill in the settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 3 — Add Environment Variables
In Vercel → **Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://hostelbird-api.onrender.com` |

> ⚠️ Must be prefixed with `VITE_` — Vite only exposes variables with this prefix to the browser bundle.

### Step 4 — Deploy
Click **Deploy**. Vercel will:
1. Run `npm install`
2. Run `npm run build` (Vite builds to `dist/`)
3. Serve `dist/` as a static site
4. Use `vercel.json` rewrites to handle React Router routes

Wait ~1 minute. Your site will be live at:
```
https://hostelbird-build-break.vercel.app
```

### Step 5 — Update Render CORS
Go back to Render → **Environment** tab and update:

| Key | Value |
|-----|-------|
| `ALLOWED_ORIGINS` | `https://hostelbird-build-break.vercel.app` |

Click **Save** — Render will redeploy automatically.

---

## Part 3 — Verify Everything Works

### Test the backend
```
GET https://hostelbird-api.onrender.com/health
GET https://hostelbird-api.onrender.com/api/destinations
GET https://hostelbird-api.onrender.com/api/properties
```

### Test the frontend
| Page | URL |
|------|-----|
| Home | `https://hostelbird-build-break.vercel.app/` |
| Fix Lab | `https://hostelbird-build-break.vercel.app/debug` |
| Bir destination | `https://hostelbird-build-break.vercel.app/location/bir` |
| SkyNest property | `https://hostelbird-build-break.vercel.app/property/skynest-bir` |

---

## Part 4 — Custom Vercel Domain (optional)

If your Vercel project gets a different URL than expected:
1. Vercel dashboard → **Settings → Domains** → note your actual URL
2. Update Render `ALLOWED_ORIGINS` to match the actual URL

---

## Troubleshooting

### "This page is not working" on Vercel
- Make sure `vercel.json` exists in `frontend/` (it's already in the repo)
- The rewrites entry handles React Router — without it all routes 404

### API calls fail on live site
- Check `VITE_API_URL` in Vercel env vars — must be your exact Render URL, no trailing slash
- Check `ALLOWED_ORIGINS` in Render env vars — must be your exact Vercel URL

### Render backend shows "502"
- Free Render instances spin down after 15 minutes of inactivity
- First request after idle takes ~30 seconds to wake up — this is normal on the free tier
- Subsequent requests are fast

### Environment variables not working
- Vercel: redeploy after adding env vars (they're baked into the build)
- Render: env var changes trigger automatic redeploy

---

## Local Development (reference)

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev        # http://localhost:4000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev        # http://localhost:5173
# Vite proxies /api/* to localhost:4000 automatically
```
