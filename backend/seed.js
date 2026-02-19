// Database Seed Script
// Run this script to seed the database with initial admin user
// Usage: node backend/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'kejanihomeskenya@admin.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'kejanihomeskenya@admin.com',
      password: 'Password', // Will be hashed by the pre-save hook
      dateOfBirth: new Date('1990-01-01'), // Default date of birth
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      gender: 'prefer_not_to_say'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Email: kejanihomeskenya@admin.com');
    console.log('Password: Password');
    console.log('Role: admin');
    console.log('-----------------------------------');
    console.log('Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAdmin();
