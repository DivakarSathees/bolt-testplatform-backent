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

    let body;
    try {
      body = await req.json();
    } catch (err) {
      return {
        status: 400,
        jsonBody: { message: 'Invalid JSON body' }
      };
    }

    const { name, type, subject, duration, totalMarks } = body;
    const errors = [];
    if (!name || name.trim().length <3) errors.push({param:'name', msg:'name min 3 chars'});
    // if (!['JEE','NEET','Mock','Practice'].includes(type)) errors.push({param:'type', msg:'Invalid type'});
    // if (!['Physics','Chemistry','Mathematics','Biology','Mixed'].includes(subject)) errors.push({param:'subject', msg:'Invalid subject'});
    // if (!Number.isInteger(duration) || duration<1) errors.push({param:'duration', msg:'Duration positive integer'});
    // if (!Number.isInteger(totalMarks) || totalMarks<1) errors.push({param:'totalMarks', msg:'TotalMarks positive integer'});
    if (errors.length) return { status:400, jsonBody: {errors} };

    try {
      const test = await Test.create({ ...body, createdBy: authResult.user._id });
      return { status:201, jsonBody: { message:'Test created successfully', test } };
    } catch (e) {
      console.error(e);
      return { status:500, jsonBody:{ message:'Server error', error: e } };
    }
  }
});
