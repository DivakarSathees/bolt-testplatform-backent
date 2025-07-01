const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/user.model');

app.http('boltgetUsers', {
  methods: ['GET'],
  route: 'users',
  authLevel: 'anonymous',
  handler: async (req, context) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const roleCheck = await authorize(['superadmin', 'centeradmin'], authResult.user);
    if (!roleCheck.authorized) return roleCheck.response;

    const { role, center, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (center) query.center = center;

    if (authResult.user.role === 'centeradmin') {
      query.center = authResult.user.center;
    }

    try {
      const users = await User.find(query)
        .select('-password')
        .populate('instituteId', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      return {
        status: 200,
        jsonBody: {
          users,
          totalPages: Math.ceil(total / limit),
          currentPage: Number(page),
          total,
        },
      };
    } catch (err) {
      return { status: 500, jsonBody: { message: 'Server error', err   } };
    }
  },
});
