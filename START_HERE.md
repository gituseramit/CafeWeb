# 🚀 START HERE - Cyber-Café Setup

## ⚠️ CRITICAL: Don't Open HTML Files Directly!

**The page is blank because you're opening the HTML file directly.** React apps must run through a development server.

## Quick Start (Windows)

### Option 1: Use Batch Files (Easiest)

1. **Double-click `start-backend.bat`** - This starts the API server
2. **Double-click `start-frontend.bat`** - This starts the web app
3. **Open http://localhost:3000 in your browser** (NOT the HTML file!)

### Option 2: Manual Setup

**Step 1: Install Dependencies**

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd cyber-cafe\backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd cyber-cafe\frontend
npm install
```

**Step 2: Configure Environment**

**Backend:**
```bash
cd cyber-cafe\backend
copy .env.example .env
# Edit .env and add your database URL and Razorpay keys
```

**Frontend:**
```bash
cd cyber-cafe\frontend
copy .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:5000/api
```

**Step 3: Setup Database**

Make sure PostgreSQL is installed and running, then:
```bash
cd cyber-cafe\backend
npm run migrate
npm run seed
```

**Step 4: Start Servers**

**Terminal 1 (Backend):**
```bash
cd cyber-cafe\backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 (Frontend):**
```bash
cd cyber-cafe\frontend
npm run dev
```
✅ Frontend running on http://localhost:3000

**Step 5: Open in Browser**

👉 **Go to: http://localhost:3000** (NOT file://)

## Default Admin Login

- Email: `admin@cybercafe.com`
- Phone: `9999999999`
- Password: `admin123`

## Common Issues

### ❌ "Blank page" or CORS errors
**Cause:** Opening HTML file directly  
**Fix:** Use http://localhost:3000 (after running `npm run dev`)

### ❌ "Cannot find module"
**Cause:** Dependencies not installed  
**Fix:** Run `npm install` in both backend and frontend folders

### ❌ "Connection refused" or API errors
**Cause:** Backend not running  
**Fix:** Make sure backend is running on port 5000

### ❌ Database errors
**Cause:** PostgreSQL not running or wrong connection string  
**Fix:** 
- Start PostgreSQL service
- Check DATABASE_URL in backend/.env

## Need Help?

See `SETUP.md` for detailed instructions.

