require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@prime.edu' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  await User.create({
    name: 'Admin',
    email: 'admin@prime.edu',
    password: 'Admin@123',    // Change this!
    role: 'admin',
  });

  console.log('Admin created: admin@prime.edu / Admin@123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });