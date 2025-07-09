const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth } = require('../middleware/auth');
const Test = require('../boltmodels/Test');

app.http('boltGetTestsByCourseId', {
  methods: ['GET'],
    route: 'courses/{courseId}/tests',
    authLevel: 'anonymous',
    handler: async (req) => {
        await connectDB();
        const authResult = await auth(req);
        if (!authResult.authorized) return authResult.response;

        const courseId = req.params.courseId;
        if (!courseId) return { status: 400, jsonBody: { message: 'Course ID is required' } };

        try {
            const tests = await Test.find({ courseId, isActive: true })
                .populate('createdBy', 'name')
                .select('-questionIds')
                .sort({ createdAt: -1 })
                .lean();

            return { status: 200, jsonBody: { tests } };
        } catch (e) {
            console.error(e);
            return { status: 500, jsonBody: { message: 'Server error', error: e } };
        }
    }
});