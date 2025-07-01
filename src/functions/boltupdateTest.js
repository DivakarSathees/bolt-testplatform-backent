const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth, authorize } = require('../middleware/auth');
const Test = require('../boltmodels/Test');

app.http('boltupdateTest', {
  methods: ['PUT'],
  route: 'tests/{id}',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['contentadmin','trainer','superadmin'], authResult.user);
    if (!perms.authorized) return perms.response;

    try {
      const test = await Test.findById(req.params.id);
      if (!test) return { status:404, jsonBody:{ message:'Test not found' } };

      if (authResult.user.role==='trainer' && test.createdBy.toString()!==authResult.user._id.toString()) {
        return { status:403, jsonBody:{ message:'Access denied' } };
      }

      const updated = await Test.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true })
        .populate('questions')
        .populate('createdBy', 'name');

      return { status:200, jsonBody:{ message:'Test updated successfully', test:updated } };
    } catch (e) {
      console.error(e);
      return { status:500, jsonBody:{ message:'Server error', error: e } };
    }
  }
});
