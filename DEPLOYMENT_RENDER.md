# Deploying to Render.com (Recommended)

Render is perfect for this full-stack application with PostgreSQL support.

## Step-by-Step Guide

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub/GitLab/Bitbucket.

### 2. Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Connect your repository

### 3. Create PostgreSQL Database

1. **New → PostgreSQL**
2. Name: `cybercafe-db`
3. Region: Choose closest to you
4. Plan: Free tier (or paid)
5. Click **Create Database**
6. **Save the Internal Database URL** (you'll need it)

### 4. Create Web Service (Backend)

1. **New → Web Service**
2. Connect your repository
3. Settings:
   - **Name**: `cybercafe-backend`
   - **Region**: Same as database
   - **Branch**: `main` (or your branch)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier (or paid)

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<from PostgreSQL service>
   JWT_SECRET=<generate-random-string>
   RAZORPAY_KEY_ID=<your-key>
   RAZORPAY_KEY_SECRET=<your-secret>
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

5. Click **Create Web Service**

### 5. Run Database Migrations

After backend deploys:

1. Go to backend service → **Shell**
2. Run:
   ```bash
   npm run migrate
   npm run seed
   ```

### 6. Deploy Frontend (Static Site)

1. **New → Static Site**
2. Connect repository
3. Settings:
   - **Name**: `cybercafe-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://cybercafe-backend.onrender.com/api
     VITE_RAZORPAY_KEY_ID=<your-key>
     ```

4. Click **Create Static Site**

### 7. Update Backend CORS

Update `FRONTEND_URL` in backend environment variables to your frontend URL.

### 8. Access Your App

- Frontend: `https://cybercafe-frontend.onrender.com`
- Backend API: `https://cybercafe-backend.onrender.com/api`

## Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free

## Production Tips

1. **Upgrade to paid plan** for always-on service
2. **Use custom domain** (free SSL)
3. **Set up monitoring** in Render dashboard
4. **Enable auto-deploy** from main branch
5. **Use Render's managed PostgreSQL** backups

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is in same region
- Use Internal Database URL (not External)

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Render uses 18.x by default)

### File Upload Issues
- Render free tier has limited disk space
- Consider using S3-compatible storage (DigitalOcean Spaces, AWS S3)
- Update file upload configuration

## Alternative: Railway.app

Railway is another great option with similar features:

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL service
4. Deploy backend and frontend
5. Set environment variables

Railway's free tier is more generous for development.

