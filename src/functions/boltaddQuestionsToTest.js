const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth, authorize } = require('../middleware/auth');
const Test = require('../boltmodels/Test');

app.http('boltaddQuestionsToTest', {
  methods: ['PATCH'],
  route: 'tests/{id}/add-questions',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['contentadmin','superadmin'], authResult.user);
    if (!perms.authorized) return perms.response;

    let body;
    try {
      body = await req.json();
    }
    catch (err) {
      return { status:400, jsonBody:{ message:'Invalid JSON body' } };
    }
    if (!body || !body.questionIds) {
      return { status:400, jsonBody:{ message:'questionId is required' } };
    }

    const { questionIds } = body;
    try {
      const test = await Test.findById(req.params.id);
      if (!test) return { status:404, jsonBody:{ message:'Test not found' } };

      // if (!test.questionIds.includes(questionIds)) {
      //   test.questionIds.push(questionIds);
      //   await test.save();
      // }
      // Ensure all IDs are strings (or ObjectIds)
      const validIds = questionIds.map(id => id.toString());

      // Filter out already added questionIds
      const newIds = validIds.filter(id => !test.questionIds.map(q => q.toString()).includes(id));

      if (newIds.length > 0) {
        test.questionIds.push(...newIds);
        await test.save();
      }

      return { status:200, jsonBody:{ success:true } };
    } catch (e) {
      console.error(e);
      return { status:500, jsonBody:{ message:'Server error', error:e } };
    }
  }
});
