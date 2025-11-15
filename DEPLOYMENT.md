# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 14+ (or use Docker)
- Node.js 18+ (for local development)
- Razorpay account with API keys

## Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd cyber-cafe
```

2. **Configure environment variables**

Create `.env` file in the root directory:
```env
JWT_SECRET=your-super-secret-jwt-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

3. **Start services**
```bash
docker-compose up -d
```

4. **Initialize database**
```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

## Manual Deployment

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database**
```bash
# Create database
createdb cybercafe

# Run migrations
npm run migrate

# Seed data
npm run seed
```

5. **Start server**
```bash
# Development
npm run dev

# Production
npm start
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with API URL
```

4. **Build for production**
```bash
npm run build
```

5. **Serve with nginx or any static file server**
```bash
# Using nginx
sudo cp -r dist/* /var/www/html/

# Or use a simple server
npx serve -s dist
```

## Production Deployment

### Using Docker (Recommended)

1. **Update docker-compose.yml**
   - Set proper environment variables
   - Configure volumes for persistent data
   - Set up reverse proxy (nginx/traefik)

2. **Use production database**
   - Update DATABASE_URL to production PostgreSQL
   - Use managed database service (AWS RDS, DigitalOcean, etc.)

3. **Configure file storage**
   - For production, use S3-compatible storage
   - Update file upload configuration
   - Or use persistent volumes

4. **Set up SSL/HTTPS**
   - Use Let's Encrypt with nginx
   - Configure domain name
   - Update FRONTEND_URL and CORS settings

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/cybercafe
JWT_SECRET=strong-random-secret-key
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=https://yourdomain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_RAZORPAY_KEY_ID=your-key-id
```

### Database Migration

For production database:
```bash
# Connect to production database
export DATABASE_URL=postgresql://user:password@host:5432/cybercafe

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Monitor logs
- [ ] Set up firewall rules

### Scaling

1. **Horizontal Scaling**
   - Run multiple backend instances behind load balancer
   - Use shared file storage (S3, NFS)
   - Use managed PostgreSQL with connection pooling

2. **Database Optimization**
   - Add database indexes
   - Use connection pooling
   - Regular VACUUM and ANALYZE

3. **Caching**
   - Add Redis for session storage
   - Cache frequently accessed data
   - Use CDN for static assets

### Monitoring

1. **Application Monitoring**
   - Set up error tracking (Sentry, Rollbar)
   - Monitor API response times
   - Track order completion rates

2. **Database Monitoring**
   - Monitor query performance
   - Set up slow query logging
   - Track connection pool usage

3. **Server Monitoring**
   - CPU and memory usage
   - Disk space
   - Network traffic

### Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Store backups off-site
   - Test restore procedures

2. **File Backups**
   - Backup uploaded files regularly
   - Use versioned storage (S3 versioning)

### Updates

1. **Update Application**
```bash
git pull
docker-compose build
docker-compose up -d
```

2. **Database Migrations**
```bash
docker-compose exec backend npm run migrate
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL
   - Verify database is running
   - Check firewall rules

2. **File Upload Errors**
   - Check upload directory permissions
   - Verify disk space
   - Check file size limits

3. **Payment Gateway Issues**
   - Verify Razorpay credentials
   - Check webhook configuration
   - Review payment logs

4. **CORS Errors**
   - Update FRONTEND_URL in backend
   - Check CORS configuration
   - Verify API URL in frontend

## Support

For deployment issues:
- Check logs: `docker-compose logs`
- Review error messages
- Consult documentation
- Contact support team

