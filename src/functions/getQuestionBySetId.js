const {app} = require('@azure/functions');
const connectDB = require('../utils/db');
const { getQuestionsBySetId } = require('../controllers/question.controller');
const { verifyToken } = require('../middleware/auth.middleware');
app.http('getQuestionBySetId', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'questions/set/{setId}',
  handler: async (request, context) => {
    try {
      await connectDB();
      verifyToken(request);

      const setId = request.params.setId;
        if (!setId) {
            return { status: 400, jsonBody: { error: 'Question set ID is required' } };
        }
        const questions = await getQuestionsBySetId(setId);

      return { status: 200, jsonBody: questions };
    } catch (err) {
      return { status: err.status || 500, jsonBody: { error: err.message || 'Something went wrong' } };
    }
  }
});
