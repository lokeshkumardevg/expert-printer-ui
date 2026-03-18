const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017';
const dbName = 'techforcall';

const test = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, { dbName });
    console.log('Connected!');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
};

test();
