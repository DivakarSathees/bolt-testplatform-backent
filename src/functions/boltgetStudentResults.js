const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth } = require('../middleware/auth');
const Result = require('../boltmodels/Result');

app.http('getStudentResults', {
  methods: ['GET'],
  route: 'results/student/{studentId?}',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();

    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const studentId = req.params.studentId || authResult.user._id;
    if (authResult.user.role === 'student' && authResult.user._id.toString() !== studentId) {
      return { status: 403, jsonBody: { message: 'Access denied' } };
    }

    const { page = 1, limit = 10 } = req.query;

    const results = await Result.find({ student: studentId })
      .populate('test', 'title type subject duration totalMarks')
      .populate('student', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Result.countDocuments({ student: studentId });

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
