import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pool from './config/database.js';
import bcrypt from 'bcryptjs';

// Import routes
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import predictorRoutes from './routes/predictorRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import savedRoutes from './routes/savedRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/predictor', predictorRoutes);
app.use('/api', publicRoutes);
app.use('/api/saved', savedRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize default admin on startup
async function initializeAdmin() {
  try {
    // Check if admins table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'admins'"
    );

    if (tables.length === 0) {
      console.log('⚠️  Admins table does not exist. Please run the database schema first.');
      return;
    }

    const [admins] = await pool.execute(
      'SELECT id FROM admins WHERE username = ?',
      [process.env.DEFAULT_ADMIN_USERNAME || 'admin']
    );

    if (admins.length === 0) {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      await pool.execute(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        [process.env.DEFAULT_ADMIN_USERNAME || 'admin', hashedPassword]
      );

      console.log('✅ Default admin created');
      console.log(`   Username: ${process.env.DEFAULT_ADMIN_USERNAME || 'admin'}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log('   ⚠️  Please change the default password after first login!');
    } else {
      console.log('✅ Admin already exists');
    }
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('⚠️  Database tables not found. Please run the SQL schema file first.');
      console.log('   Run: mysql -u root -p admit_genie < config/dbSchema.sql');
    } else {
      console.error('❌ Error initializing admin:', error.message);
    }
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /api/users/register - User registration`);
  console.log(`   POST /api/users/login - User login`);
  console.log(`   POST /api/admin/login - Admin login`);
  console.log(`   POST /api/chatbot/query - Chatbot query`);
  console.log(`   POST /api/predictor/predict - Rank prediction`);
  console.log(`   GET  /api/colleges - Get colleges`);
  console.log(`   GET  /api/courses - Get courses`);
  console.log(`   GET  /api/exams - Get exam schedules`);
  console.log(`\n`);

  // Initialize default admin
  await initializeAdmin();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});

export default app;

