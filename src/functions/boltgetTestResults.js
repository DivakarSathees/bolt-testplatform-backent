const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth, authorize } = require('../middleware/auth');
const Result = require('../boltmodels/Result');

app.http('getTestResults', {
  methods: ['GET'],
  route: 'results/test/{testId}',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();

    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['contentadmin','trainer','superadmin','centeradmin'], authResult.user);
    if (!perms.authorized) return perms.response;

    const { page = 1, limit = 10 } = req.query;
    const results = await Result.find({ test: req.params.testId })
      .populate('student', 'name email center')
      .populate('test', 'title type subject')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'score.total': -1 });

    const total = await Result.countDocuments({ test: req.params.testId });

    return {
      status: 200,
      jsonBody: {
        results,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    };
  }
});
