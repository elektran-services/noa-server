const Program = require('../models/program.model');
const OAP = require('../models/oap.model');
const Media = require('../models/media.model');
const { sendError } = require('../utils/api-response');
const { findNowOnAir, findUpNext } = require('../utils/schedule');

exports.getDashboardSummary = async (req, res) => {
  try {
    const stationId = req.station._id;

    const [programsCount, oapsCount, mediaCount] = await Promise.all([
      Program.countDocuments({ station: stationId }),
      OAP.countDocuments({ station: stationId }),
      Media.countDocuments({ station: stationId })
    ]);

    const now = new Date();
    const programs = await Program.find({ station: stationId })
      .populate('thumbnail', 'path')
      .populate('oaps', 'oapName realName picture');
    const nowOnAir = findNowOnAir(programs, now);

    const upNext = findUpNext(programs, now);

    res.json({
      counts: {
        programs: programsCount,
        oaps: oapsCount,
        media: mediaCount
      },
      nowOnAir: nowOnAir || null,
      upNext: upNext || null
    });
  } catch (error) {
    return sendError(res, 500, 'Failed to get dashboard summary', error.message, 'DASHBOARD_FETCH_FAILED');
  }
}; 