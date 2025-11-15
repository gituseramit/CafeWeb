# Deploying to Vercel - Important Notes

## ⚠️ Limitations

Vercel is designed for serverless functions, but this application has:
- **PostgreSQL database** (needs persistent connection)
- **File uploads** (needs persistent storage)
- **Long-running processes** (not ideal for serverless)

## Recommended Deployment Options

### Option 1: Split Deployment (Recommended)

**Frontend on Vercel + Backend on Railway/Render**

1. **Deploy Frontend to Vercel:**
   ```bash
   cd frontend
   vercel
   ```

2. **Deploy Backend to Railway/Render:**
   - Railway: https://railway.app
   - Render: https://render.com
   - Both support PostgreSQL and persistent file storage

3. **Update Frontend Environment:**
   - Set `VITE_API_URL` to your backend URL

### Option 2: Full Stack on Render (Easiest)

Render supports full-stack apps with PostgreSQL:

1. Connect your GitHub repo to Render
2. Create a PostgreSQL database
3. Deploy as a Web Service
4. Set environment variables
5. Run migrations: `npm run migrate && npm run seed`

### Option 3: Docker on VPS/Cloud

Deploy using Docker Compose on:
- DigitalOcean Droplet
- AWS EC2
- Google Cloud Compute Engine
- Azure VM

## Vercel Configuration (If You Must)

If you still want to try Vercel, you need to:

1. **Use Vercel Postgres** (not external PostgreSQL)
2. **Use Vercel Blob Storage** for file uploads
3. **Convert backend to serverless functions**

This requires significant code changes. See `DEPLOYMENT.md` for better options.

## Quick Deploy to Render

1. Sign up at https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: `cd backend && npm install && cd ../frontend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
5. Add Environment Variables:
   - `DATABASE_URL` (from Render PostgreSQL)
   - `JWT_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
6. Create PostgreSQL database on Render
7. Deploy!

## Environment Variables for Vercel

If deploying frontend only to Vercel:

```
VITE_API_URL=https://your-backend-url.com/api
VITE_RAZORPAY_KEY_ID=your-key
```

## Troubleshooting Vercel Errors

- **FUNCTION_INVOCATION_FAILED**: Backend code error or missing dependencies
- **FUNCTION_INVOCATION_TIMEOUT**: Function taking too long (serverless limit)
- **DEPLOYMENT_NOT_FOUND**: Check build configuration
- **NOT_FOUND**: Routing issue, check `vercel.json`

For production, **Render or Railway are better choices** for this full-stack app.

