# EduAssist – Ministry of Education, Liberia
## Complete Setup & Deployment Guide

---

## 📁 PROJECT STRUCTURE

```
eduassist-server/
├── server/
│   └── index.js        ← Secure Node.js backend server
├── public/
│   └── index.html      ← Frontend chatbot (served by the server)
├── package.json        ← Dependencies
├── .env.example        ← Environment variable template
├── .gitignore          ← Keeps .env and node_modules out of Git
└── SETUP.md            ← This file
```

---

## STEP 1 — GET YOUR ANTHROPIC API KEY

1. Go to: https://console.anthropic.com
2. Sign up or log in
3. Click **API Keys** in the left menu
4. Click **Create Key** → name it "EduAssist MoE Liberia"
5. Copy the key (starts with `sk-ant-api03-...`)
6. Keep it safe — treat it like a password

**Budget tip:** Set a monthly spending limit in the console so costs stay controlled.

---

## STEP 2 — INSTALL NODE.JS (if not installed)

Download from: https://nodejs.org (choose the LTS version)

Verify installation:
```bash
node --version   # should show v18 or higher
npm --version
```

---

## STEP 3 — SET UP THE PROJECT LOCALLY

```bash
# 1. Navigate into the project folder
cd eduassist-server

# 2. Install all dependencies
npm install

# 3. Create your .env file from the template
cp .env.example .env

# 4. Open .env and paste your API key
# Change this line:  ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
# To your real key:  ANTHROPIC_API_KEY=sk-ant-api03-abc123...

# 5. Start the server
npm start

# 6. Open your browser and go to:
#    http://localhost:3000
```

The chatbot should now be running locally and fully functional!

---

## STEP 4 — DEPLOY TO THE INTERNET (Free Options)

### Option A: Render.com (Recommended — Free tier available)

1. Go to https://render.com and create a free account
2. Click **New** → **Web Service**
3. Connect your GitHub account and upload this project
4. Set these settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add environment variables in the Render dashboard:
   - `ANTHROPIC_API_KEY` = your API key
   - `ALLOWED_ORIGINS` = `https://yourdomain.com`
6. Click **Deploy** — Render gives you a free URL like `eduassist.onrender.com`

### Option B: Railway.app (Also free tier)

1. Go to https://railway.app
2. Click **New Project** → **Deploy from GitHub**
3. Add your `ANTHROPIC_API_KEY` in the Variables tab
4. Railway auto-detects Node.js and deploys automatically

### Option C: Your own VPS (DigitalOcean, AWS, etc.)

```bash
# On your server:
git clone <your-repo>
cd eduassist-server
npm install
cp .env.example .env
nano .env   # paste your API key

# Run with PM2 (keeps it running 24/7)
npm install -g pm2
pm2 start server/index.js --name "eduassist"
pm2 startup
pm2 save
```

---

## STEP 5 — CONNECT YOUR DOMAIN

### If using Render or Railway:
1. In your hosting dashboard, go to **Custom Domains**
2. Add your domain (e.g. `eduassist.moe.gov.lr`)
3. They will give you a CNAME record to add to your DNS

### DNS Settings (at your domain registrar):
```
Type:  CNAME
Name:  eduassist  (or @ for root domain)
Value: your-app.onrender.com  (the URL Render gave you)
TTL:   Auto
```

### For a government subdomain (eduassist.moe.gov.lr):
Contact your MoE IT department and give them the CNAME value from Render/Railway.
They will add it to the moe.gov.lr DNS records.

---

## STEP 6 — ENABLE HTTPS (SSL)

- **Render & Railway:** HTTPS is automatic and free ✅
- **Own VPS:** Use Nginx + Let's Encrypt (free SSL certificates)

```bash
# On Ubuntu/Debian VPS:
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d eduassist.moe.gov.lr
```

---

## SECURITY FEATURES INCLUDED

✅ API key stored server-side only (never in the browser)
✅ Rate limiting: 60 messages per IP per 15 minutes
✅ CORS protection: Only your domain can call the API
✅ Input validation: Rejects empty or oversized requests
✅ .env file excluded from Git via .gitignore
✅ Conversation length limit: max 50 messages

---

## COST ESTIMATE

| Component     | Cost                                      |
|--------------|-------------------------------------------|
| API Key      | Free to create                            |
| API Usage    | ~$0.003 per message (very cheap)          |
| Render/Railway hosting | Free tier available             |
| Domain (.com)| ~$12/year (Namecheap/Cloudflare)         |
| SSL          | Free (Let's Encrypt or included hosting) |
| **Total/month** | **~$10–50** depending on traffic      |

---

## SUPPORT

For technical help, contact your MoE IT department or email:
contact@moe.gov.lr | Hotline: 1144
