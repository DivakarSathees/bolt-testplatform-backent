const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const Question = require('../boltmodels/Question');
const { auth, authorize } = require('../middleware/auth');

app.http('boltUpdateQuestion', {
  methods: ['PUT'],
  route: 'questions/{id}',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();

    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['contentadmin', 'trainer', 'superadmin'], authResult.user);
    if (!perms.authorized) return perms.response;

    try {
      const existing = await Question.findById(req.params.id);
      if (!existing) return { status: 404, jsonBody: { message: 'Question not found' } };

      if (authResult.user.role === 'trainer' &&
          existing.createdBy.toString() !== authResult.user._id.toString()) {
        return { status: 403, jsonBody: { message: 'Access denied' } };
      }

      const updated = await Question.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name');

      return {
        status: 200,
        jsonBody: { message: 'Question updated successfully', question: updated }
      };
    } catch (error) {
      return { status: 500, jsonBody: { message: 'Server error', error } };
    }
  }
});
