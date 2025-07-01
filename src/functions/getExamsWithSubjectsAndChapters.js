const {app} = require('@azure/functions');
const connectDB = require('../utils/db');
const {getExamsWithSubjectsAndChapters} = require('../controllers/exam.controller');
const {verifyToken} = require('../middleware/auth.middleware');
app.http('getExamsWithSubjectsAndChapters', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'exams/subjects-chapters',

  handler: async (request, context) => {
    try {
      await connectDB();
      const user = verifyToken(request);

      const result = await getExamsWithSubjectsAndChapters(user.userId);

      return {
        status: 200,
        jsonBody: {
          message: 'Exams with subjects and chapters retrieved successfully',
          data: result
        }
      };
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: {error: err.message || 'Something went wrong'}
      };
    }
  }
});