# Quick Setup Guide

## ⚠️ IMPORTANT: Don't Open HTML Files Directly!

The React app **must** be run through a development server. Opening `index.html` directly in a browser will cause CORS errors and a blank page.

## Step-by-Step Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your settings:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (any random string)
# - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (from Razorpay dashboard)
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
# Edit .env:
# VITE_API_URL=http://localhost:5000/api
# VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

### 3. Setup Database

Make sure PostgreSQL is running, then:

```bash
cd backend
npm run migrate
npm run seed
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

### 5. Access the Application

Open your browser and go to: **http://localhost:3000**

**Default Admin Login:**
- Email: admin@cybercafe.com
- Phone: 9999999999
- Password: admin123

## Troubleshooting

### Blank Page / CORS Errors

✅ **Solution:** Make sure you're accessing http://localhost:3000 (not file://)
✅ **Check:** Is the Vite dev server running? (`npm run dev` in frontend folder)
✅ **Check:** Are there any errors in the terminal?

### "Cannot find module" Errors

✅ **Solution:** Run `npm install` in both backend and frontend folders

### Database Connection Errors

✅ **Solution:** 
- Make sure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database exists: `createdb cybercafe`

### Port Already in Use

✅ **Solution:** 
- Change port in `vite.config.js` (frontend)
- Change PORT in backend/.env

## Using Docker (Alternative)

If you prefer Docker:

```bash
# From project root
docker-compose up -d

# Initialize database
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

Then access http://localhost:3000

