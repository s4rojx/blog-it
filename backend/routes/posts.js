const express = require('express');
const router = express.Router();
const { 
  createPost, 
  getPosts, 
  getPost, 
  updatePost, 
  deletePost, 
  addComment, 
  deleteComment, 
  likePost 
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for post image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, 'post-' + uniqueSuffix + '.' + ext);
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

// Post routes
router.route('/')
  .post(protect, upload.single('coverImage'), createPost)
  .get(getPosts);

router.route('/:id')
  .get(getPost)
  .put(protect, upload.single('coverImage'), updatePost)
  .delete(protect, deletePost);

// Comment routes
router.route('/:id/comments')
  .post(protect, addComment);

router.route('/:id/comments/:commentId')
  .delete(protect, deleteComment);

// Like route
router.put('/:id/like', protect, likePost);

module.exports = router;
