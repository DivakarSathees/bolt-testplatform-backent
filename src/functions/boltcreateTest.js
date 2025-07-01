const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth, authorize } = require('../middleware/auth');
const Test = require('../boltmodels/Test');

app.http('boltcreateTest', {
  methods: ['POST'],
  route: 'tests',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['contentadmin','trainer','superadmin'], authResult.user);
    if (!perms.authorized) return perms.response;

    const { title, type, subject, duration, totalMarks } = req.body;
    const errors = [];
    if (!title || title.trim().length <3) errors.push({param:'title', msg:'Title min 3 chars'});
    if (!['JEE','NEET','Mock','Practice'].includes(type)) errors.push({param:'type', msg:'Invalid type'});
    if (!['Physics','Chemistry','Mathematics','Biology','Mixed'].includes(subject)) errors.push({param:'subject', msg:'Invalid subject'});
    if (!Number.isInteger(duration) || duration<1) errors.push({param:'duration', msg:'Duration positive integer'});
    if (!Number.isInteger(totalMarks) || totalMarks<1) errors.push({param:'totalMarks', msg:'TotalMarks positive integer'});
    if (errors.length) return { status:400, jsonBody: {errors} };

    try {
      const test = await Test.create({ ...req.body, createdBy: authResult.user._id });
      return { status:201, jsonBody: { message:'Test created successfully', test } };
    } catch (e) {
      console.error(e);
      return { status:500, jsonBody:{ message:'Server error', error: e } };
    }
  }
});
