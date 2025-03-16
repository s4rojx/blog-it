const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    // Process tags if provided
    let tagArray = [];
    if (tags) {
      try {
        // Try to parse as JSON first
        tagArray = JSON.parse(tags);
      } catch (e) {
        // If parsing fails, assume it's a comma-separated string
        tagArray = tags.split(',').map(tag => tag.trim());
      }
    }

    // Handle cover image if uploaded
    let coverImage = '';
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    // Create new post
    const post = await Post.create({
      title,
      content,
      coverImage,
      author: req.user._id,
      tags: tagArray
    });

    // Populate author details
    const populatedPost = await Post.findById(post._id).populate({
      path: 'author',
      select: 'username profilePicture'
    });

    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by tag if provided
    if (tag) {
      query.tags = tag;
    }
    
    // Search by title or content if search term provided
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const posts = await Post.find(query)
      .populate({
        path: 'author',
        select: 'username profilePicture'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      posts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'author',
        select: 'username profilePicture bio'
      })
      .populate({
        path: 'comments.user',
        select: 'username profilePicture'
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    // Find post
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Process tags if provided
    let tagArray = post.tags;
    if (tags) {
      try {
        // Try to parse as JSON first
        tagArray = JSON.parse(tags);
      } catch (e) {
        // If parsing fails, assume it's a comma-separated string
        tagArray = tags.split(',').map(tag => tag.trim());
      }
    }

    // Handle cover image if uploaded
    let coverImage = post.coverImage;
    if (req.file) {
      // Delete old image if exists
      if (post.coverImage) {
        const oldImagePath = path.join(__dirname, '..', post.coverImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      coverImage = `/uploads/${req.file.filename}`;
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: title || post.title,
        content: content || post.content,
        coverImage,
        tags: tagArray
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'author',
      select: 'username profilePicture'
    });

    res.status(200).json({
      success: true,
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete cover image if exists
    if (post.coverImage) {
      const imagePath = path.join(__dirname, '..', post.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete post
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add comment
    post.comments.unshift({
      user: req.user._id,
      text
    });

    await post.save();

    // Get updated post with populated comments
    const updatedPost = await Post.findById(req.params.id)
      .populate({
        path: 'comments.user',
        select: 'username profilePicture'
      });

    res.status(201).json({
      success: true,
      comments: updatedPost.comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Find comment
    const comment = post.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the comment author or post author or admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Remove comment
    post.comments = post.comments.filter(
      comment => comment._id.toString() !== req.params.commentId
    );

    await post.save();

    res.status(200).json({
      success: true,
      comments: post.comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Like/Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post has already been liked by user
    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike post
      post.likes = post.likes.filter(
        like => like.toString() !== req.user._id.toString()
      );
    } else {
      // Like post
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      likes: post.likes,
      likesCount: post.likes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
