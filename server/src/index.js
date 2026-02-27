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

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

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
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'jobhai' });
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.warn('⚠️  The server is starting WITHOUT a database connection. Some features will not work.');
        console.warn('💡 Tip: If you see "ECONNREFUSED", ensure your current IP is whitelisted in MongoDB Atlas (Network Access tab).');

        // Start server anyway even if DB fails, to allow diagnostics/docs
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT} (Database disconnected)`));
    }
};

connectDB();

module.exports = app;
