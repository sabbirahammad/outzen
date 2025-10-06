import mongoose from 'mongoose';
import User from './models/userModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected for seeding'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'outzen@gmail.com' });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'outzen@gmail.com',
      password: '123456',
      role: 'admin'
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: outzen@gmail.com');
    console.log('🔑 Password: 123456');
    console.log('👑 Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();