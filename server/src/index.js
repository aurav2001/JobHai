require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const passport = require('./passport');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const employerRoutes = require('./routes/employer');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── CORS Middleware (must be before helmet for Vercel serverless) ─────────────
const allowedOrigins = [
    'https://jobhai-cyan.vercel.app',
    (process.env.FRONTEND_URL || '').trim(),
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));


// ── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: 'Too many requests, please try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// ── Parsing Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

// ── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ── Swagger Docs ─────────────────────────────────────────────────────────────
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'JobHai API', version: '1.0.0', description: 'Job Portal REST API' },
        servers: [{ url: process.env.SERVER_URL || 'http://localhost:5000' }],
        components: {
            securitySchemes: { BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
        },
    },
    apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const missingVars = [
        'MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL'
    ].filter(v => !process.env[v]);

    res.json({
        status: 'ok',
        database: dbStatus,
        missingEnvVars: missingVars.length > 0 ? missingVars : 'none',
        timestamp: new Date().toISOString()
    });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Database + Server ─────────────────────────────────────────────────────────
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        await mongoose.connect(process.env.MONGODB_URI, { 
            dbName: 'jobhai',
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.error('Error Stack:', err.stack);
        console.warn('⚠️  Check MONGODB_URI, IP Whitelist (0.0.0.0/0), and Database Credentials.');
    }
};

// For Vercel, we export the app and don't call listen. 
// For local development, we call connectDB and then listen.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    connectDB().then(() => {
        if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
            app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
        }
    });
} else {
    // On Vercel, we still need to initiate the connection
    connectDB();
}

module.exports = app;
