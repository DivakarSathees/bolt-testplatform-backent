const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth, authorize } = require('../middleware/auth');
const Test = require('../boltmodels/Test');

app.http('boltaddQuestionsToTest', {
  methods: ['PUT'],
  route: 'tests/{id}/add-question',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['contentadmin','superadmin'], authResult.user);
    if (!perms.authorized) return perms.response;

    const { questionId } = req.body;
    try {
      const test = await Test.findById(req.params.id);
      if (!test) return { status:404, jsonBody:{ message:'Test not found' } };

      if (!test.questions.includes(questionId)) {
        test.questions.push(questionId);
        await test.save();
      }
      return { status:200, jsonBody:{ success:true } };
    } catch (e) {
      console.error(e);
      return { status:500, jsonBody:{ message:'Server error', error:e } };
    }
  }
});
