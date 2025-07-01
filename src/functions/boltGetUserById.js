const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth } = require('../middleware/auth');
const User = require('../models/user.model');

app.http('boltGetUserById', {
  methods: ['GET'],
  route: 'users/{id}',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const userId = req.params.id;

    try {
      const user = await User.findById(userId)
        .select('-password')
        .populate('instituteId', 'name');

      if (!user) {
        return { status: 404, jsonBody: { message: 'User not found' } };
      }

      if (authResult.user.role === 'student' && authResult.user._id.toString() !== user._id.toString()) {
        return { status: 403, jsonBody: { message: 'Access denied' } };
      }

      return { status: 200, jsonBody: { user } };
    } catch (err) {
      return { status: 500, jsonBody: { message: 'Server error', err } };
    }
  },
});
