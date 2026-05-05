const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const adminEmail = 'aivizard463@gmail.com';
        const user = await User.findOne({ email: adminEmail });
        
        if (!user) {
            console.log('❌ Admin user NOT FOUND in DB');
        } else {
            console.log('✅ Admin user FOUND:');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Is Verified:', user.isVerified);
            console.log('Password Hash exists:', !!user.passwordHash);
            
            const match = await user.comparePassword('Admin@123');
            console.log('Password "Admin@123" matches:', match);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAdmin();
