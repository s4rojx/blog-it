const fs = require('fs');
const path = require('path');

// Define the uploads directory path
const uploadsDir = path.join(__dirname, 'uploads');

// Check if the directory exists, if not create it
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created successfully at:', uploadsDir);
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    process.exit(1);
  }
} else {
  console.log('Uploads directory already exists at:', uploadsDir);
}

// Test write permissions by creating a test file
const testFile = path.join(uploadsDir, 'test.txt');
try {
  fs.writeFileSync(testFile, 'Test write permissions');
  console.log('Write permissions confirmed');
  
  // Clean up test file
  fs.unlinkSync(testFile);
} catch (error) {
  console.error('Error writing to uploads directory:', error);
  console.error('Please check directory permissions');
  process.exit(1);
}

console.log('Uploads directory setup complete and ready for use');
