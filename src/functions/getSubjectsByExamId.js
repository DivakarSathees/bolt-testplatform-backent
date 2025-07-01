// getSubjectsByExamId with endpoint api/subjects?examId=686415a581aca082adf4b63d
const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { getSubjectsByExamId } = require('../controllers/subject.controller');

app.http('getSubjectsByExamId', {
  methods: ['GET'],
  route: 'subjects',
    authLevel: 'anonymous',
    handler: async (request, context) => {
    try {
      await connectDB();
      // Extract examId from query parameters - Request query: URLSearchParams { 'examId' => '686417368bc78a6ee395cbec' }
        const examId = request.query.get('examId');

      

      if (!examId) {
        return {
          status: 400,
          jsonBody: { error: 'Exam ID is required' }
        };
      }

      const subjects = await getSubjectsByExamId(examId);
      return {
        status: 200,
        jsonBody: { count: subjects.length, subjects }
      };
    } catch (err) {
      return {
        status: 500,
        jsonBody: { error: err.message || 'Something went wrong' }
      };
    }
    }
});