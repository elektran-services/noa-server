const Media = require('../models/media.model');
const fs = require('fs').promises;
const path = require('path');

// Upload media
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const media = new Media({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      station: req.station._id
    });

    await media.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      media: {
        id: media._id,
        filename: media.filename,
        originalname: media.originalname,
        path: media.path
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Get all media for station with pagination and filtering
exports.getStationMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items per page
    const skip = (page - 1) * limit;
    const type = req.query.type; // Filter by mimetype

    // Build query
    const query = {
      station: req.station._id
    };

    // Add type filter if provided
    if (type) {
      query.mimetype = type;
    }

    // Get total count for pagination
    const total = await Media.countDocuments(query);

    // Get paginated results
    const media = await Media.find(query)
      .select('filename originalname path mimetype size createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({
      media,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get media', error: error.message });
  }
};

// Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findOne({
      _id: req.params.id,
      station: req.station._id
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../uploads', media.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with deletion from database even if file deletion fails
    }

    await media.deleteOne();

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete media', error: error.message });
  }
}; 