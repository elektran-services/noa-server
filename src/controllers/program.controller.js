const Program = require('../models/program.model');
const Station = require('../models/station.model');
const { sendError } = require('../utils/api-response');
const { findNowOnAir, findUpNext, DAYS_OF_WEEK } = require('../utils/schedule');

// Create new program
exports.createProgram = async (req, res) => {
  try {
    const program = new Program({
      ...req.body,
      station: req.station._id
    });

    await program.save();

    const populated = await Program.findById(program._id)
      .populate('thumbnail', 'path')
      .populate('oaps', 'oapName realName picture');

    res.status(201).json({
      message: 'Program created successfully',
      program: populated
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to create program', error.message, 'PROGRAM_CREATE_FAILED');
  }
};

// Get all programs for station (Public endpoint - uses stationName query param)
exports.getPrograms = async (req, res) => {
  try {
    const { stationName } = req.query;

    // Validate stationName parameter
    if (!stationName) {
      return sendError(res, 400, 'Station name is required', null, 'VALIDATION_ERROR');
    }

    // Find station by name (case-insensitive)
    const station = await Station.findOne({ 
      stationName: { $regex: new RegExp(`^${stationName.trim()}$`, 'i') }
    });

    if (!station) {
      return sendError(res, 404, 'Station not found', null, 'NOT_FOUND');
    }

    const programs = await Program.find({ station: station._id })
      .populate('thumbnail', 'path')
      .populate('oaps', 'oapName realName picture')
      .sort('duration.start');

    res.json({ programs });
  } catch (error) {
    return sendError(res, 500, 'Failed to get programs', error.message, 'PROGRAM_FETCH_FAILED');
  }
};

// Get programs by day (Public endpoint - uses stationName query param)
exports.getProgramsByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const { stationName } = req.query;

    // Validate stationName parameter
    if (!stationName) {
      return sendError(res, 400, 'Station name is required', null, 'VALIDATION_ERROR');
    }

    // Find station by name (case-insensitive)
    const station = await Station.findOne({ 
      stationName: { $regex: new RegExp(`^${stationName.trim()}$`, 'i') }
    });

    if (!station) {
      return sendError(res, 404, 'Station not found', null, 'NOT_FOUND');
    }

    const programs = await Program.find({
      station: station._id,
      days: day
    })
      .populate('thumbnail', 'path')
      .populate('oaps', 'oapName realName picture')
      .sort('duration.start');

    res.json({ programs });
  } catch (error) {
    return sendError(res, 500, 'Failed to get programs', error.message, 'PROGRAM_FETCH_FAILED');
  }
};

// Get current on-air program (Public endpoint - uses stationName query param)
exports.getNowOnAir = async (req, res) => {
  try {
    const { stationName, debug } = req.query;

    // Validate stationName parameter
    if (!stationName) {
      return sendError(res, 400, 'Station name is required', null, 'VALIDATION_ERROR');
    }

    // Find station by name (case-insensitive)
    const station = await Station.findOne({ 
      stationName: { $regex: new RegExp(`^${stationName.trim()}$`, 'i') }
    });

    if (!station) {
      return sendError(res, 404, 'Station not found', null, 'NOT_FOUND');
    }

    const now = new Date();
    const currentDay = DAYS_OF_WEEK[now.getDay()];

    // Debug mode: return all programs and current time info
    if (debug === 'true') {
      const allPrograms = await Program.find({ station: station._id })
        .populate('thumbnail', 'path')
        .populate('oaps', 'oapName realName picture');
      
      return res.json({
        debug: true,
        serverTime: now.toISOString(),
        currentTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        currentDay: currentDay,
        stationId: station._id,
        totalPrograms: allPrograms.length,
        programs: allPrograms.map(p => ({
          programName: p.programName,
          days: p.days,
          duration: p.duration
        }))
      });
    }

    const programs = await Program.find({ station: station._id })
      .populate('thumbnail', 'path')
      .populate('oaps', 'oapName realName picture');
    const program = findNowOnAir(programs, now);

    if (!program) {
      return res.json({ message: 'No program currently on air' });
    }

    return res.json({ program });
  } catch (error) {
    return sendError(res, 500, 'Failed to get current program', error.message, 'PROGRAM_FETCH_FAILED');
  }
};

// Get up next program (Public endpoint - uses stationName query param)
exports.getUpNext = async (req, res) => {
  try {
    const { stationName } = req.query;

    // Validate stationName parameter
    if (!stationName) {
      return sendError(res, 400, 'Station name is required', null, 'VALIDATION_ERROR');
    }

    // Find station by name (case-insensitive)
    const station = await Station.findOne({ 
      stationName: { $regex: new RegExp(`^${stationName.trim()}$`, 'i') }
    });

    if (!station) {
      return sendError(res, 404, 'Station not found', null, 'NOT_FOUND');
    }

    const now = new Date();
    const programs = await Program.find({ station: station._id })
      .populate('thumbnail', 'path')
      .populate('oaps', 'oapName realName picture');
    const nextProgram = findUpNext(programs, now);

    if (!nextProgram) {
      return res.json({ message: 'No upcoming programs scheduled' });
    }

    return res.json({ program: nextProgram });
  } catch (error) {
    return sendError(res, 500, 'Failed to get next program', error.message, 'PROGRAM_FETCH_FAILED');
  }
};

// Update program
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findOneAndUpdate(
      { _id: req.params.id, station: req.station._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('thumbnail', 'path')
     .populate('oaps', 'oapName realName picture');

    if (!program) {
      return sendError(res, 404, 'Program not found', null, 'NOT_FOUND');
    }

    res.json({
      message: 'Program updated successfully',
      program
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to update program', error.message, 'PROGRAM_UPDATE_FAILED');
  }
};

// Delete program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findOneAndDelete({
      _id: req.params.id,
      station: req.station._id
    });

    if (!program) {
      return sendError(res, 404, 'Program not found', null, 'NOT_FOUND');
    }

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    return sendError(res, 500, 'Failed to delete program', error.message, 'PROGRAM_DELETE_FAILED');
  }
};

// Combined now-and-next summary (Public endpoint - uses stationName query param)
exports.getNowAndNextSummary = async (req, res) => {
  try {
    const { stationName } = req.query;

    // Validate stationName parameter
    if (!stationName) {
      return sendError(res, 400, 'Station name is required', null, 'VALIDATION_ERROR');
    }

    // Find station by name (case-insensitive)
    const station = await Station.findOne({ 
      stationName: { $regex: new RegExp(`^${stationName.trim()}$`, 'i') }
    });

    if (!station) {
      return sendError(res, 404, 'Station not found', null, 'NOT_FOUND');
    }

    const now = new Date();

    const buildImageUrl = (mediaDoc) => {
      if (!mediaDoc || !mediaDoc.path) return null;
      return `${req.protocol}://${req.get('host')}${mediaDoc.path.startsWith('/') ? '' : '/'}${mediaDoc.path}`;
    };

    const allPrograms = await Program.find({ station: station._id })
      .populate('thumbnail', 'path')
      .populate('oaps', 'oapName');
    const nowOnAir = findNowOnAir(allPrograms, now);

    const upNext = findUpNext(allPrograms, now);

    const formatProgram = (p) => {
      if (!p) return null;
      return {
        programName: p.programName,
        duration: p.duration,
        oaps: Array.isArray(p.oaps) ? p.oaps.map(o => o.oapName) : [],
        image: buildImageUrl(p.thumbnail)
      };
    };

    res.json({
      nowOnAir: formatProgram(nowOnAir),
      upNext: formatProgram(upNext)
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to get now-and-next summary', error.message, 'PROGRAM_FETCH_FAILED');
  }
}; 