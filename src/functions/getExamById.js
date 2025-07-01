const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { getExamById } = require('../controllers/exam.controller');

app.http('getExamById', {
  methods: ['GET'],
  route: 'exam/{id}',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      await connectDB();
      const id = context.params.id;
      const exam = await getExamById(id);

      return {
        status: 200,
        jsonBody: exam
      };
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { error: err.message || 'Something went wrong' }
      };
    }
  }
});
