const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth } = require('../middleware/auth');
const Test = require('../boltmodels/Test');

app.http('boltgetTestById', {
  methods: ['GET'],
  route: 'tests/{id}',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    try {
      const test = await Test.findById(req.params.id)
        .populate('questions')
        .populate('createdBy', 'name')
        .populate('allowedCenters', 'name');

      if (!test) return { status: 404, jsonBody: { message: 'Test not found' } };

      if (authResult.user.role === 'student') {
        const allowed = test.allowedCenters.some(c => c._id.toString() === authResult.user.center.toString());
        const now = new Date();
        if (!allowed) return { status: 403, jsonBody: { message: 'Access denied' } };
        if (now < test.startDate || now > test.endDate) {
          return { status: 403, jsonBody: { message: 'Test is not available at this time' } };
        }
        const safeTest = {
          _id: test._id,
          title: test.title,
          description: test.description,
          type: test.type,
          subject: test.subject,
          difficulty: test.difficulty,
          duration: test.duration,
          totalMarks: test.totalMarks,
          startDate: test.startDate,
          endDate: test.endDate,
          createdBy: test.createdBy,
          allowedCenters: test.allowedCenters,
          questionCount: test.questions?.length || 0,
          instructions: test.instructions,
          negativeMarking: test.negativeMarking,
          createdAt: test.createdAt
        };
        return { status: 200, jsonBody: { test: safeTest } };
      }

      return { status: 200, jsonBody: { test } };
    } catch (e) {
      console.error(e);
      return { status: 500, jsonBody: { message: 'Server error', error: e } };
    }
  }
});
