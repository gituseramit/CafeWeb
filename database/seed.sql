-- Seed data for Cyber-Café Services

-- Insert default admin user (password: admin123 - change in production!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@cybercafe.com', '9999999999', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert services
INSERT INTO services (name, description, base_price, min_price, max_price, unit, category) VALUES
-- Printing Services
('Printout (B/W)', 'A4 size black and white printout', 5.00, 5.00, 5.00, 'per page', 'Printing'),
('Printout (Color)', 'A4 size color printout', 10.00, 10.00, 10.00, 'per page', 'Printing'),
('Photocopy (B/W)', 'A4 black and white photocopy', 2.00, 2.00, 2.00, 'per page', 'Printing'),
('Photocopy (Color)', 'A4 color photocopy', 10.00, 10.00, 10.00, 'per page', 'Printing'),

-- Scanning & Document Services
('Scanning', 'Document/photo scan', 10.00, 10.00, 10.00, 'per page', 'Document Services'),
('PDF Creation/Conversion', 'JPG to PDF, merge, compress', 25.00, 20.00, 30.00, 'per document', 'Document Services'),
('Document Typing', 'English/Hindi typing service', 30.00, 20.00, 40.00, 'per page', 'Document Services'),
('Document Corrections', 'Editing text in documents', 30.00, 20.00, 40.00, 'per page', 'Document Services'),

-- Photo Services
('Photo Printing', 'Passport-size (4×6 sheet = 8 photos)', 30.00, 30.00, 30.00, 'per sheet', 'Photo Services'),
('Photo Editing', 'Photoshop editing service', 100.00, 50.00, 150.00, 'per photo', 'Photo Services'),
('Photograph Capture', 'With webcam/backdrop', 40.00, 30.00, 50.00, 'per session', 'Photo Services'),

-- ID & Card Services
('Aadhar Print / PVC', 'Digital print or PVC card', 75.00, 50.00, 100.00, 'per card', 'ID Services'),
('Lamination', 'A4 lamination service', 20.00, 20.00, 20.00, 'per sheet', 'ID Services'),

-- Form & Application Services
('Form Filling', 'Any online form filling', 75.00, 50.00, 100.00, 'per form', 'Form Services'),
('PAN Apply', 'NSDL/UTI portal application', 190.00, 180.00, 200.00, 'per application', 'Form Services'),
('College/School Forms', 'Admissions, registrations', 45.00, 30.00, 60.00, 'per form', 'Form Services'),
('Job Application Services', 'Govt/Private job forms', 60.00, 40.00, 80.00, 'per application', 'Form Services'),
('Online Registration', 'Exams, college, govt schemes', 50.00, 30.00, 70.00, 'per registration', 'Form Services'),

-- Payment & Financial Services
('Online Bill Payments', 'Electricity/Water/Gas bill payment', 25.00, 20.00, 30.00, 'per transaction', 'Financial Services'),
('Mobile Recharge', 'Any prepaid/postpaid recharge', 15.00, 10.00, 20.00, 'per recharge', 'Financial Services'),
('Money Transfer', 'AEPS/DMT money transfer', 17.50, 10.00, 25.00, 'per transaction', 'Financial Services'),
('AEPS Cash Withdrawal', 'Aadhar ATM service', 7.50, 5.00, 10.00, 'per transaction', 'Financial Services'),

-- Professional Services
('Resume/Bio-data Making', 'Basic to professional resume', 100.00, 50.00, 150.00, 'per resume', 'Professional Services'),
('Data Entry Work', 'Data entry based on workload', 50.00, 50.00, NULL, 'per project', 'Professional Services'),
('GST Filing (Basic)', 'Monthly GST return filing', 250.00, 200.00, 300.00, 'per filing', 'Professional Services'),

-- Data Services
('CD/DVD Writing', 'Burning data to disc', 40.00, 30.00, 50.00, 'per disc', 'Data Services'),
('Pen Drive/Data Transfer', 'Copy files to/from USB', 30.00, 20.00, 40.00, 'per transfer', 'Data Services'),
('Printout from Email/Phone', 'Documents via WhatsApp/mail', 10.00, 10.00, 10.00, 'per document', 'Data Services');

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('tax_percentage', '{"value": 0}', 'Tax percentage (0-100)'),
('service_charge', '{"value": 0}', 'Service charge amount'),
('working_hours', '{"open": "09:00", "close": "21:00"}', 'Working hours'),
('currency', '{"symbol": "₹", "code": "INR"}', 'Currency settings'),
('razorpay_enabled', '{"value": true}', 'Enable Razorpay payments'),
('auto_assign_orders', '{"value": false}', 'Auto-assign orders to staff')
ON CONFLICT (key) DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory (item_name, item_type, quantity, unit, min_threshold) VALUES
('A4 Paper (White)', 'Paper', 1000, 'sheets', 200),
('A4 Paper (Color)', 'Paper', 500, 'sheets', 100),
('Ink Cartridge (Black)', 'Ink', 5, 'units', 2),
('Ink Cartridge (Color)', 'Ink', 3, 'units', 1),
('Lamination Sheets', 'Lamination', 200, 'sheets', 50),
('Photo Paper (4x6)', 'Photo Paper', 100, 'sheets', 20);

