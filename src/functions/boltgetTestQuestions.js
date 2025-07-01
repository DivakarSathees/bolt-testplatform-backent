const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth } = require('../middleware/auth');
const Test = require('../boltmodels/Test');

app.http('boltgetTestQuestions', {
  methods: ['GET'],
  route: 'tests/{id}/questions',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    try {
      const test = await Test.findById(req.params.id).populate('questions');
      if (!test) return { status:404, jsonBody:{ message:'Test not found' } };
      return { status:200, jsonBody:{ questions: test.questions } };
    } catch (e) {
      console.error(e);
      return { status:500, jsonBody:{ message:'Server error', error:e } };
    }
  }
});
