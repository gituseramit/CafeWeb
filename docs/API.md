# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new customer account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9999999999",
    "role": "customer"
  },
  "token": "jwt-token"
}
```

#### POST /auth/login
Login with email/phone and password.

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "password": "password123"
}
```

#### GET /auth/me
Get current user information (requires authentication).

---

### Services

#### GET /services
Get all services (public endpoint).

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search in name/description
- `active` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "services": [
    {
      "id": "uuid",
      "name": "Printout (B/W)",
      "description": "A4 size black and white printout",
      "base_price": 5.00,
      "unit": "per page",
      "category": "Printing",
      "active": true
    }
  ]
}
```

#### GET /services/:id
Get service by ID.

#### POST /services
Create a new service (admin only).

**Request Body:**
```json
{
  "name": "New Service",
  "description": "Service description",
  "base_price": 10.00,
  "min_price": 5.00,
  "max_price": 15.00,
  "unit": "per page",
  "category": "Printing",
  "active": true
}
```

#### PUT /services/:id
Update service (admin only).

#### DELETE /services/:id
Delete service (admin only).

---

### Orders

#### POST /orders
Create a new order.

**Request:** Multipart form data
- `items`: JSON array of order items
- `customer_name`: Customer name
- `customer_phone`: Customer phone (required)
- `customer_email`: Customer email (optional)
- `payment_method`: "online" | "cash" | "pay_later"
- `pickup_time`: ISO datetime string (optional)
- `delivery_address`: Delivery address (optional)
- `notes`: Additional notes (optional)
- `files`: File uploads (multiple files allowed)

**Example items:**
```json
[
  {
    "service_id": "uuid",
    "quantity": 10,
    "options": {}
  }
]
```

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "ticket_number": "CC241201234",
    "status": "pending",
    "payment_status": "pending",
    "final_amount": 50.00,
    "items": [...],
    "files": [...]
  }
}
```

#### GET /orders
Get orders (filtered by user if not admin).

**Query Parameters:**
- `status`: Filter by status
- `payment_status`: Filter by payment status
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

#### GET /orders/:id
Get order by ID.

#### PUT /orders/:id/status
Update order status (admin/staff only).

**Request Body:**
```json
{
  "status": "in_progress",
  "assigned_to": "user-uuid",
  "notes": "Optional notes"
}
```

---

### Payments

#### POST /payments/create
Create a Razorpay payment order.

**Request Body:**
```json
{
  "order_id": "uuid",
  "amount": 50.00
}
```

**Response:**
```json
{
  "transaction": {...},
  "razorpay_order_id": "order_xxx",
  "key": "razorpay-key-id"
}
```

#### POST /payments/verify
Verify Razorpay payment.

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}
```

#### POST /payments/webhook
Razorpay webhook endpoint (handles payment events).

#### POST /payments/cash
Mark cash payment received (admin/cashier only).

**Request Body:**
```json
{
  "order_id": "uuid"
}
```

---

### Admin

#### GET /admin/dashboard
Get dashboard statistics (admin/cashier only).

**Response:**
```json
{
  "stats": {
    "today_orders": 10,
    "pending_orders": 5,
    "in_progress_orders": 3,
    "ready_orders": 2,
    "today_revenue": 500.00,
    "total_revenue": 10000.00
  }
}
```

#### GET /admin/users
Get all users (admin/cashier only).

#### PUT /admin/users/:id
Update user (admin only).

#### GET /admin/settings
Get all settings (admin/cashier only).

#### PUT /admin/settings/:key
Update setting (admin only).

---

### Reports

#### GET /reports/daily
Get daily sales report (admin/cashier only).

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format (default: today)

#### GET /reports/daily/export
Export daily report as CSV (admin/cashier only).

#### GET /reports/services
Get service-wise sales report (admin/cashier only).

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "errors": [...] // For validation errors
}
```

**Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

