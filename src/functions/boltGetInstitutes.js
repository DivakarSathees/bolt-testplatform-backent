const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth } = require('../middleware/auth');
const Institute = require('../boltmodels/Institute'); // Assuming Institute is the model for centers

app.http('boltGetInstitutes', {
  methods: ['GET'],
  route: 'centers',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const { page = 1, limit = 10 } = req.query;
    const query = {};

    if (authResult.user.role === 'centeradmin') {
      query._id = authResult.user.center;
    }

    try {
      const centers = await Institute.find(query)
        .populate('admin', 'name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Institute.countDocuments(query);

      return {
        status: 200,
        jsonBody: {
          centers,
          totalPages: Math.ceil(total / limit),
          currentPage: Number(page),
          total
        }
      };
    } catch (error) {
      return { status: 500, jsonBody: { message: 'Server error', error } };
    }
  }
});
