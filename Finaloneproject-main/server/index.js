const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
} else {
  console.log('Uploads directory exists:', uploadsDir);
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// In-memory database (replace with actual database in production)
let portfolios = {};

// Create or update portfolio
app.post('/api/portfolio', (req, res) => {
  try {
    const { id, ...portfolioData } = req.body;
    const portfolioId = id || uuidv4();
    
    console.log('Saving portfolio with ID:', portfolioId);
    console.log('Portfolio data keys:', Object.keys(portfolioData));
    
    portfolios[portfolioId] = {
      ...portfolioData,
      id: portfolioId,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Portfolio saved successfully. Total portfolios:', Object.keys(portfolios).length);
    console.log('Saved portfolio ID:', portfolioId);
    
    res.json({ success: true, id: portfolioId, portfolio: portfolios[portfolioId] });
  } catch (error) {
    console.error('Error saving portfolio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get portfolio by ID
app.get('/api/portfolio/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching portfolio with ID:', id);
    console.log('Available portfolio IDs:', Object.keys(portfolios));
    
    const portfolio = portfolios[id];
    
    if (!portfolio) {
      console.log('Portfolio not found for ID:', id);
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }
    
    console.log('Portfolio found:', portfolio.id);
    res.json({ success: true, portfolio });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload certificate
app.post('/api/upload-certificate', (req, res) => {
  upload.single('certificate')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
      }
      if (err.message) {
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).json({ success: false, error: 'File upload failed. Please try again.' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      
      console.log('File uploaded successfully:', req.file.filename);
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ success: true, url: fileUrl, filename: req.file.filename });
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  });
});

// Download certificate
app.get('/api/certificate/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all portfolios (for admin purposes)
app.get('/api/portfolios', (req, res) => {
  res.json({ success: true, portfolios });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
});
