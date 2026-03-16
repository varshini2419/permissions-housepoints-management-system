const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const {
  uploadDocument,
  uploadImage,
  uploadDocumentController,
  uploadImageController
} = require('../controllers/uploadController');

router.post('/document', protect, uploadDocument.single('document'), uploadDocumentController);
router.post('/image', protect, uploadImage.single('proofImage'), uploadImageController);

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next(error);
});

module.exports = router;