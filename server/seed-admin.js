const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        console.log('🔄 Connecting to MongoDB to seed admin...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const adminEmail = process.env.ADMIN_EMAIL || 'aivizard463@gmail.com';
        const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123';

        const existing = await User.findOne({ email: adminEmail });
        if (existing) {
            console.log('ℹ️ Admin user already exists:', adminEmail);
            process.exit(0);
        }

        const admin = new User({
            name: 'Super Admin',
            email: adminEmail,
            passwordHash: adminPass,
            role: 'admin',
            isVerified: true,
            isActive: true
        });

        await admin.save();
        console.log('🚀 Admin user created successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPass);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding admin:', err.message);
        process.exit(1);
    }
};

seedAdmin();
