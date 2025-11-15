# Quick Deployment Guide

## Option 1: Render.com (Easiest - Recommended)

### Using render.yaml (Automatic)

1. **Push code to GitHub**
2. **Go to https://render.com**
3. **New → Blueprint**
4. **Connect your GitHub repo**
5. **Select `render.yaml`**
6. **Click Apply**
7. **Add missing environment variables:**
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `VITE_RAZORPAY_KEY_ID` (in frontend service)
8. **After deployment, run migrations:**
   - Go to backend service → Shell
   - Run: `cd backend && npm run migrate && npm run seed`

### Manual Render Setup

See `DEPLOYMENT_RENDER.md` for detailed manual steps.

---

## Option 2: Railway.app

1. **Go to https://railway.app**
2. **New Project → Deploy from GitHub**
3. **Add PostgreSQL service**
4. **Add backend service:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add frontend service:**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist`
6. **Set environment variables** (same as Render)
7. **Run migrations** in backend service shell

---

## Option 3: Docker Deployment

### Using Docker Compose (Local/Server)

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### Using Root Dockerfile

If your platform needs a root-level Dockerfile:

```bash
# Build
docker build -t cyber-cafe .

# Run (requires external PostgreSQL)
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  cyber-cafe
```

---

## Option 4: Vercel (Frontend Only)

1. **Deploy frontend to Vercel:**
   ```bash
   cd frontend
   vercel
   ```

2. **Deploy backend separately** to Render/Railway

3. **Update frontend environment:**
   - `VITE_API_URL` = your backend URL

---

## Environment Variables Checklist

### Backend
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Random string (or generate)
- ✅ `RAZORPAY_KEY_ID` - From Razorpay dashboard
- ✅ `RAZORPAY_KEY_SECRET` - From Razorpay dashboard
- ✅ `FRONTEND_URL` - Your frontend URL
- ✅ `PORT` - Usually 10000 for Render, 5000 for others

### Frontend
- ✅ `VITE_API_URL` - Your backend API URL
- ✅ `VITE_RAZORPAY_KEY_ID` - From Razorpay dashboard

---

## Post-Deployment Steps

1. ✅ **Run database migrations:**
   ```bash
   npm run migrate
   npm run seed
   ```

2. ✅ **Test the application:**
   - Visit frontend URL
   - Try creating an order
   - Test admin login

3. ✅ **Update Razorpay webhook URL:**
   - Go to Razorpay Dashboard → Webhooks
   - Add: `https://your-backend-url.com/api/payments/webhook`

4. ✅ **Change default admin password:**
   - Login with default credentials
   - Update password in admin settings

---

## Troubleshooting

### "Dockerfile not found"
- ✅ Use `render.yaml` for Render (no Dockerfile needed)
- ✅ Or specify Dockerfile path in platform settings
- ✅ Or use the root `Dockerfile` I created

### Database connection errors
- ✅ Check `DATABASE_URL` is correct
- ✅ Verify database is running
- ✅ Use internal database URL (not external)

### Build failures
- ✅ Check Node.js version (18+)
- ✅ Verify all dependencies in package.json
- ✅ Check build logs for specific errors

### CORS errors
- ✅ Update `FRONTEND_URL` in backend env vars
- ✅ Ensure frontend URL matches exactly

---

## Recommended: Render.com

**Why Render?**
- ✅ Free tier available
- ✅ Built-in PostgreSQL
- ✅ Easy deployment
- ✅ Auto SSL certificates
- ✅ Simple environment variable management

**Get started in 5 minutes:**
1. Sign up at render.com
2. New → Blueprint
3. Connect GitHub
4. Select `render.yaml`
5. Add Razorpay keys
6. Deploy!

See `DEPLOYMENT_RENDER.md` for detailed steps.

