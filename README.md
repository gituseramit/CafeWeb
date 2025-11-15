# Cyber-Café Management System

A full-stack, production-ready website for managing a cyber-café business. Customers can view services, book jobs, upload files, and make payments. Staff can manage services, orders, and track sales through an admin panel.

## Features

### Customer Features
- Browse and search service catalog with descriptions and rates
- Submit jobs with file uploads (PDF, images, DOCX)
- Get itemized estimates before booking
- Online payment (Razorpay) or pay-in-shop option
- Track order status and receive notifications
- Download receipts and job tickets

### Admin Features
- Role-based access control (admin, cashier, staff)
- CRUD operations for services and pricing
- Order management dashboard with status tracking
- Assign jobs to stations/printers
- Daily sales and order reports (CSV/PDF export)
- Manual order creation and refunds
- Settings management (tax, service charges, working hours)

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **File Storage**: Local storage (configurable for S3)
- **Authentication**: JWT
- **Payments**: Razorpay
- **Deployment**: Docker + Docker Compose

## Project Structure

```
cyber-cafe/
├── backend/          # Express API server
├── frontend/         # React application
├── database/         # Schema and migrations
├── docs/            # Documentation
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, for containerized deployment)
- Razorpay account (for payment integration)

### Installation

#### Option 1: Docker (Recommended)

1. **Clone and configure:**
```bash
cd cyber-cafe
# Create .env file with your configuration
# See backend/.env.example and frontend/.env.example
```

2. **Start all services:**
```bash
docker-compose up -d
```

3. **Initialize database:**
```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed services
docker-compose exec backend npm run seed
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Default admin: admin@cybercafe.com / admin123

#### Option 2: Manual Setup

1. **Setup backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and Razorpay credentials
npm run migrate
npm run seed
npm run dev
```

2. **Setup frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm start
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/cybercafe
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key
```

## API Documentation

See `docs/API.md` for detailed API documentation.

## User Manual

See `docs/USER_MANUAL.md` for instructions on using the system.

## Testing

Run backend tests:
```bash
cd backend
npm test
```

## Project Structure

```
cyber-cafe/
├── backend/              # Express API server
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth, audit logging
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (file upload, pricing, etc.)
│   ├── scripts/         # Migration and seed scripts
│   └── server.js        # Entry point
├── frontend/            # React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts (Auth)
│   │   ├── pages/       # Page components
│   │   └── utils/      # API client, helpers
│   └── public/         # Static assets
├── database/           # SQL schema and seed data
├── docs/               # Documentation
└── docker-compose.yml  # Docker configuration
```

## Key Features Implemented

✅ Service catalog with search and filters  
✅ Job submission with file uploads  
✅ Online payment integration (Razorpay)  
✅ Order tracking and status updates  
✅ Admin dashboard with statistics  
✅ Service management (CRUD)  
✅ Order management with status updates  
✅ Daily sales reports with CSV export  
✅ Settings management  
✅ User authentication and authorization  
✅ Audit logging  
✅ Receipt generation ready  

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions
- Role-based access control
- Audit logging for admin actions

## Next Steps / Future Enhancements

- [ ] Email notifications
- [ ] SMS/WhatsApp notifications
- [ ] Receipt PDF generation
- [ ] Print preview and page selection
- [ ] Inventory management
- [ ] Multi-store support
- [ ] Live queue display
- [ ] Printer integration (CUPS)
- [ ] Advanced analytics dashboard

## License

MIT

