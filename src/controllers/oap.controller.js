const OAP = require('../models/oap.model');

// Create new OAP
exports.createOAP = async (req, res) => {
  try {
    const { programs, ...oapData } = req.body;

    const oap = new OAP({
      ...oapData,
      station: req.station._id
    });

    await oap.save();

    res.status(201).json({
      message: 'OAP created successfully',
      oap: await OAP.findById(oap._id)
        .populate('programs', 'programName duration')
        .populate('picture', 'path')
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create OAP', error: error.message });
  }
};

// Get all OAPs for station with pagination and search
exports.getOAPs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items per page
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      station: req.station._id
    };

    // Add search if provided
    if (search) {
      query.oapName = { $regex: search, $options: 'i' };
    }

    // Get total count for pagination
    const total = await OAP.countDocuments(query);

    // Get paginated results
    const oaps = await OAP.find(query)
      .populate('programs', 'programName duration')
      .populate('picture', 'path')
      .sort('oapName')
      .skip(skip)
      .limit(limit);

    res.json({
      oaps,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get OAPs', error: error.message });
  }
};

// Get OAP by ID
exports.getOAPById = async (req, res) => {
  try {
    const oap = await OAP.findOne({
      _id: req.params.id,
      station: req.station._id
    })
      .populate('programs', 'programName duration days')
      .populate('picture', 'path');

    if (!oap) {
      return res.status(404).json({ message: 'OAP not found' });
    }

    res.json({ oap });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get OAP', error: error.message });
  }
};

// Update OAP
exports.updateOAP = async (req, res) => {
  try {
    const oap = await OAP.findOneAndUpdate(
      { _id: req.params.id, station: req.station._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('programs', 'programName duration')
      .populate('picture', 'path');

    if (!oap) {
      return res.status(404).json({ message: 'OAP not found' });
    }

    res.json({
      message: 'OAP updated successfully',
      oap
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update OAP', error: error.message });
  }
};

// Delete OAP
exports.deleteOAP = async (req, res) => {
  try {
    const oap = await OAP.findOneAndDelete({
      _id: req.params.id,
      station: req.station._id
    });

    if (!oap) {
      return res.status(404).json({ message: 'OAP not found' });
    }

    res.json({ message: 'OAP deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete OAP', error: error.message });
  }
}; 
 