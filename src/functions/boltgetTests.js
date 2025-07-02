const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth } = require('../middleware/auth');
const Test = require('../boltmodels/Test');

app.http('getTests', {
  methods: ['GET'],
  route: 'tests',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const { type, subject, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (type) query.type = type;
    if (subject) query.subject = subject;

    if (authResult.user.role === 'student') {
      query.allowedCenters = authResult.user.center;
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    try {
      const testsRaw = await Test.find(query)
        .populate('createdBy', 'name')
        .select('-questionIds')
        .limit(limit *1)
        .skip((page -1)*limit)
        .sort({ createdAt: -1 })
        .lean();

      // const tests = await Promise.all(testsRaw.map(async t => {
      //   const [res] = await Test.aggregate([
      //     { $match: { _id: t._id } },
      //     { $project: { count: { $size: '$questionIds' } } }
      //   ]);
      //   return {
      //     ...t,
      //     questionCount: res?.count || 0
      //   };
      // }));

      const tests = await Promise.all(testsRaw.map(async t => {
      const [res] = await Test.aggregate([
        { $match: { _id: t._id } },
        {
          $project: {
            count: { $size: { $ifNull: ['$questionIds', []] } }
          }
        }
      ]);
      return {
        ...t,
        questionCount: res?.count || 0
      };
      }));

      const total = await Test.countDocuments(query);
      return {
        status: 200,
        jsonBody: {
          tests,
          totalPages: Math.ceil(total/limit),
          currentPage: Number(page),
          total
        }
      };
    } catch (e) {
      console.error(e);
      return { status: 500, jsonBody: { message: 'Server error', error: e } };
    }
  }
});
