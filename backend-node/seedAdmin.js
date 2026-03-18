const mongoose = require('mongoose');
const User = require('../src/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@techforcall.ai';
const ADMIN_PASSWORD = 'ChangeMe123!';

const seed = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'techforcall';

    await mongoose.connect(mongoURI, {
      dbName: dbName,
    });
    console.log(`Connected to MongoDB: ${dbName}`);

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      phone: '',
    });

    await admin.save();

    console.log(`✅ Admin created! id=${admin._id}`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);

    // Create indexes via Mongoose
    await User.createIndexes();
    console.log('✅ Indexes created.');

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seed();
