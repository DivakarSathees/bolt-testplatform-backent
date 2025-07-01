const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth, authorize } = require('../middleware/auth');
const Question = require('../boltmodels/Question');

app.http('boltGetQuestions', {
  methods: ['GET'],
  route: 'questions',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();

    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['contentadmin', 'trainer', 'superadmin'], authResult.user);
    if (!perms.authorized) return perms.response;

    const { subject, difficulty, topic, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topic = new RegExp(topic, 'i');

    try {
      const questions = await Question.find(query)
        .populate('createdBy', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Question.countDocuments(query);
      return {
        status: 200,
        jsonBody: {
          questions,
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
