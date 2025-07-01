const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth } = require('../middleware/auth');
const User = require('../models/user.model');

app.http('boltUpdateUser', {
  methods: ['PUT'],
  route: 'users/{id}',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const userId = req.params.id;
    const { name, email, phone, studentDetails, isActive } = req.body || {};

    // Permission check
    if (authResult.user.role === 'student' && authResult.user._id.toString() !== userId) {
      return { status: 403, jsonBody: { message: 'Access denied' } };
    }

    try {
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (studentDetails) updateData.studentDetails = studentDetails;

      if (typeof isActive !== 'undefined' && ['superadmin', 'centeradmin'].includes(authResult.user.role)) {
        updateData.isActive = isActive;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password').populate('instituteId', 'name');

      if (!user) {
        return { status: 404, jsonBody: { message: 'User not found' } };
      }

      return { status: 200, jsonBody: { message: 'User updated successfully', user } };
    } catch (err) {
      return { status: 500, jsonBody: { message: 'Server error', err } };
    }
  },
});
