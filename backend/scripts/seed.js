const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seed() {
  try {
    console.log('Seeding database...');
    
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    let seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Replace password hash with actual bcrypt hash
    const adminPassword = await bcrypt.hash('admin123', 10);
    seedSQL = seedSQL.replace(
      '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
      adminPassword
    );
    
    await pool.query(seedSQL);
    console.log('✓ Seed data inserted successfully');
    console.log('Default admin credentials:');
    console.log('  Email: admin@cybercafe.com');
    console.log('  Phone: 9999999999');
    console.log('  Password: admin123');
    console.log('⚠️  Please change the admin password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

