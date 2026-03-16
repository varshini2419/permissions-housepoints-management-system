// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Upload Middleware Configuration
 * Handles file uploads for permission letters and activity proofs
 */

// ==================== DIRECTORY SETUP ====================

// Base upload directory
const UPLOAD_BASE_DIR = path.join(__dirname, '..', 'uploads');

// Upload subdirectories
const PERMISSION_LETTERS_DIR = path.join(UPLOAD_BASE_DIR, 'permission_letters');
const ACTIVITY_PROOFS_DIR = path.join(UPLOAD_BASE_DIR, 'activity_proofs');

// Allowed file types
const ALLOWED_PERMISSION_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_ACTIVITY_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Ensure upload directories exist
 * Creates directories recursively if they don't exist
 */
const ensureUploadDirectories = () => {
  const directories = [
    UPLOAD_BASE_DIR,
    PERMISSION_LETTERS_DIR,
    ACTIVITY_PROOFS_DIR
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created upload directory: ${dir}`);
    }
  });
};

// Create directories on module load
ensureUploadDirectories();

// ==================== STORAGE CONFIGURATION ====================

/**
 * Generate filename with timestamp
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const generateFilename = (req, file, cb) => {
  try {
    // Get timestamp
    const timestamp = Date.now();
    
    // Get original filename without extension
    const originalName = path.parse(file.originalname).name;
    
    // Clean filename (remove special characters, spaces)
    const cleanName = originalName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
      .substring(0, 50); // Limit length
    
    // Get file extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Construct new filename: timestamp_cleanname.ext
    const filename = `${timestamp}_${cleanName}${ext}`;
    
    cb(null, filename);
  } catch (error) {
    cb(error);
  }
};

/**
 * Permission Letter Storage Configuration
 */
const permissionLetterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PERMISSION_LETTERS_DIR);
  },
  filename: generateFilename
});

/**
 * Activity Proof Storage Configuration
 */
const activityProofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ACTIVITY_PROOFS_DIR);
  },
  filename: generateFilename
});

// ==================== FILE FILTERS ====================

/**
 * Filter for permission letter uploads
 * Allows: PDF, JPG, PNG
 */
const permissionLetterFilter = (req, file, cb) => {
  try {
    // Check file type
    if (ALLOWED_PERMISSION_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed for permission letters.'), false);
    }
  } catch (error) {
    cb(error);
  }
};

/**
 * Filter for activity proof uploads
 * Allows: JPG, PNG only (no PDF for activity proofs)
 */
const activityProofFilter = (req, file, cb) => {
  try {
    // Check file type
    if (ALLOWED_ACTIVITY_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PNG files are allowed for activity proofs.'), false);
    }
  } catch (error) {
    cb(error);
  }
};

// ==================== MULTER CONFIGURATIONS ====================

/**
 * Permission Letter Upload Configuration
 * - Max file size: 5MB
 * - Allowed types: PDF, JPG, PNG
 * - Storage: permission_letters folder
 */
const permissionLetterUpload = multer({
  storage: permissionLetterStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: permissionLetterFilter
});

/**
 * Activity Proof Upload Configuration
 * - Max file size: 5MB
 * - Allowed types: JPG, PNG
 * - Storage: activity_proofs folder
 */
const activityProofUpload = multer({
  storage: activityProofStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: activityProofFilter
});

// ==================== EXPORT CONFIGURATIONS ====================

/**
 * Export configured multer instances
 * Usage in routes:
 * 
 * For single file upload:
 * uploadPermissionLetter.single('fieldName')
 * 
 * For multiple files:
 * uploadPermissionLetter.array('fieldName', maxCount)
 */
module.exports = {
  // Permission letter upload (PDF, JPG, PNG)
  uploadPermissionLetter: permissionLetterUpload,
  
  // Activity proof upload (JPG, PNG)
  uploadActivityProof: activityProofUpload,
  
  // Convenience methods for common use cases
  uploadSinglePermissionLetter: permissionLetterUpload.single.bind(permissionLetterUpload),
  uploadMultiplePermissionLetters: permissionLetterUpload.array.bind(permissionLetterUpload),
  
  uploadSingleActivityProof: activityProofUpload.single.bind(activityProofUpload),
  uploadMultipleActivityProofs: activityProofUpload.array.bind(activityProofUpload),
  
  // Directory paths (for reference)
  paths: {
    permissionLetters: PERMISSION_LETTERS_DIR,
    activityProofs: ACTIVITY_PROOFS_DIR,
    base: UPLOAD_BASE_DIR
  }
};