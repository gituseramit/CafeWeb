# User Manual - Cyber-Café Management System

## For Customers

### Getting Started

1. **Browse Services**
   - Visit the homepage to see popular services
   - Click "Browse Services" to see the full catalog
   - Use search and category filters to find specific services

2. **Submit a Job**
   - Click "Submit Job" in the navigation
   - Select one or more services
   - Enter quantity for each service
   - Upload files if required (PDF, images, DOCX)
   - Fill in customer information (phone number is required)
   - Choose payment method:
     - **Online Payment**: Pay immediately via Razorpay
     - **Pay in Shop**: Pay when you collect
     - **Pay Later**: Pay after job completion
   - Click "Submit Job"

3. **Track Your Order**
   - After submission, you'll receive a ticket number
   - Visit `/order/{ticket-number}` to check status
   - Order statuses:
     - **Pending**: Order received, not started
     - **In Progress**: Work has begun
     - **Ready**: Job completed, ready for pickup
     - **Completed**: Order fulfilled
     - **Cancelled**: Order cancelled

4. **Account Management**
   - Register for an account to track all your orders
   - Login to access order history
   - Update your profile information

### Payment

- **Online Payment**: Complete payment via Razorpay gateway
- **Cash Payment**: Pay at the café when collecting
- **Pay Later**: Payment due on pickup

---

## For Staff/Admin

### Admin Dashboard

1. **Access Admin Panel**
   - Login with admin/cashier credentials
   - Navigate to "Admin" in the navigation menu

2. **Dashboard Overview**
   - View today's orders count
   - See pending and ready orders
   - Check today's revenue
   - Quick access to key functions

### Managing Services

1. **Add a Service**
   - Go to Admin → Services
   - Click "+ Add Service"
   - Fill in:
     - Service name
     - Description
     - Base price (required)
     - Min/Max price (optional, for variable pricing)
     - Unit (e.g., "per page", "per document")
     - Category
     - Active status
   - Click "Create"

2. **Edit a Service**
   - Find the service in the list
   - Click "Edit"
   - Modify fields as needed
   - Click "Update"

3. **Delete a Service**
   - Click "Delete" next to the service
   - Confirm deletion
   - Note: This will not affect existing orders

### Managing Orders

1. **View Orders**
   - Go to Admin → Orders
   - Use filters to find specific orders:
     - Status filter (pending, in_progress, ready, etc.)
     - Payment status filter

2. **Update Order Status**
   - Find the order in the list
   - Use the status dropdown to change status
   - Statuses:
     - **Pending**: New order, not started
     - **In Progress**: Work in progress
     - **Ready**: Completed, ready for customer
     - **Completed**: Order fulfilled
     - **Cancelled**: Order cancelled

3. **Mark Cash Payment**
   - For orders with "Pay in Shop" method
   - When customer pays, click "Mark Paid"
   - Payment status will update to "paid"

4. **View Order Details**
   - Click "View" or ticket number
   - See complete order information:
     - Customer details
     - Items and pricing
     - Files uploaded
     - Payment information

### Reports

1. **Daily Report**
   - Go to Admin → Reports
   - Select a date
   - View:
     - Total orders for the day
     - Total revenue
     - List of all orders
   - Click "Export CSV" to download report

2. **Service-wise Report**
   - View sales breakdown by service
   - Filter by date range
   - See quantity and revenue per service

### Settings

1. **Pricing Settings**
   - Go to Admin → Settings
   - Set tax percentage (0-100%)
   - Set service charge amount (₹)
   - Changes apply to new orders

2. **Working Hours**
   - Set opening time
   - Set closing time
   - (Currently for reference, can be used for future features)

### User Management

1. **View Users**
   - Go to Admin → Users (via API or future UI)
   - See all registered users
   - Filter by role

2. **Manage User Roles**
   - Update user roles (customer, staff, cashier, admin)
   - Activate/deactivate users

---

## Best Practices

### For Customers
- Provide accurate contact information
- Upload files in supported formats (PDF, images, DOCX)
- Keep your ticket number for order tracking
- Complete online payments promptly

### For Staff
- Update order status regularly
- Mark payments when received
- Review daily reports for insights
- Keep service prices updated
- Monitor pending orders

---

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size (max 10MB)
   - Ensure file type is supported
   - Try a different file

2. **Payment Not Processing**
   - Check internet connection
   - Verify Razorpay credentials are configured
   - Try again or use cash payment

3. **Order Not Showing**
   - Check filters in admin panel
   - Verify order was created successfully
   - Check user permissions

4. **Cannot Access Admin**
   - Verify you're logged in with admin/cashier account
   - Check role permissions
   - Contact system administrator

---

## Support

For technical support or questions:
- Check the documentation
- Review API documentation
- Contact system administrator

