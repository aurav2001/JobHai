const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const resetAdmin = async () => {
    try {
        console.log('🔄 Connecting to MongoDB to reset admin password...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const adminEmail = 'aivizard463@gmail.com';
        const adminPass = 'Admin@123';

        const user = await User.findOne({ email: adminEmail });
        if (!user) {
            console.log('❌ Admin user NOT FOUND. Creating new one...');
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
        } else {
            console.log('🔄 Updating password for existing admin...');
            user.passwordHash = adminPass;
            await user.save();
            console.log('✅ Password updated successfully!');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

resetAdmin();
