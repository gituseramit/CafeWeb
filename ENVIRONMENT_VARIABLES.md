# Environment Variables Guide

## Required for Application to Start

### Backend Environment Variables

**Minimum Required:**
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-random-secret-key-here
PORT=5000
```

**Optional (but recommended):**
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**For Payment Integration (Optional):**
```env
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

⚠️ **Note:** If Razorpay keys are not set, the app will still start, but online payments will be disabled. Users can still use "Pay in Shop" or "Pay Later" options.

### Frontend Environment Variables

**Required:**
```env
VITE_API_URL=https://your-backend-url.com/api
```

**Optional:**
```env
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Setting Environment Variables on Render

1. Go to your service dashboard on Render
2. Click on **Environment** tab
3. Add each variable:
   - Click **Add Environment Variable**
   - Enter the key and value
   - Click **Save Changes**

## Setting Environment Variables Locally

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cybercafe
JWT_SECRET=change-this-to-a-random-string
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Getting Razorpay Keys

1. Sign up at https://razorpay.com
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live keys
4. Copy Key ID and Key Secret

## Generating JWT_SECRET

Use any random string generator:
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use any random string generator online
```

## Quick Setup for Testing (Without Payments)

If you just want to test the app without payment integration:

**Backend .env:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=test-secret-key-12345
PORT=5000
# Don't set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
```

The app will work, but:
- ✅ All features work except online payments
- ✅ Users can still use "Pay in Shop" option
- ✅ Admin can mark cash payments manually

## Troubleshooting

### "Razorpay key_id is mandatory" Error

**Solution:** Either:
1. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` environment variables
2. OR the app should handle this gracefully (fixed in latest code)

### Database Connection Errors

**Check:**
- `DATABASE_URL` is correct
- Database is running and accessible
- Connection string format: `postgresql://user:password@host:port/database`

### Frontend Can't Connect to Backend

**Check:**
- `VITE_API_URL` points to correct backend URL
- Backend is running and accessible
- CORS is configured correctly (check `FRONTEND_URL` in backend)

