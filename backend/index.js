const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const multer = require('multer');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://blog-it-app.netlify.app', 'https://blog-it.netlify.app'] 
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created successfully at:', uploadsDir);
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    process.exit(1);
  }
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Make upload middleware available globally
app.locals.upload = upload;

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-app';
console.log('Connecting to MongoDB at:', MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@'));

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Please make sure MongoDB service is running.');
    console.log('If using localhost, check if MongoDB is installed and running.');
    console.log('You can also use MongoDB Atlas by updating your MONGODB_URI in .env file.');
    console.log('Current connection string format:', MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@'));
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Add a health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Add a root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Blog it API is running',
    endpoints: [
      '/api/auth - Authentication endpoints',
      '/api/posts - Post management endpoints'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong on the server'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
