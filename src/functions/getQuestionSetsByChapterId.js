const {app} = require('@azure/functions');
const connectDB = require('../utils/db');
const { getQuestionSetsByChapterId } = require('../controllers/questionSet.controller');
const { verifyToken } = require('../middleware/auth.middleware');
app.http('getQuestionSetsByChapterId', {
  methods: ['GET'],
  route: 'questionSets/chapter/{chapterId}',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      await connectDB();
      verifyToken(request);

    //   const chapterId = context.request.params.chapterId;
      const chapterId = request.params.chapterId;

      console.log(chapterId);
      
      const questionSets = await getQuestionSetsByChapterId(chapterId);
      return {
        status: 200,
        jsonBody: questionSets
      };
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { error: err.message || 'Something went wrong' }
      };
    }
  }
});