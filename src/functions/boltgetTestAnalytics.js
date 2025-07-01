const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth, authorize } = require('../middleware/auth');
const Result = require('../boltmodels/Result');

app.http('getTestAnalytics', {
  methods: ['GET'],
  route: 'results/analytics/{testId}',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();

    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['contentadmin','trainer','superadmin','centeradmin'], authResult.user);
    if (!perms.authorized) return perms.response;

    const results = await Result.find({ test: req.params.testId })
      .populate('student', 'name center');

    const total = results.length;
    const totalScore = results.reduce((acc, r) => acc + r.score.total, 0);
    const avgScore = total ? totalScore / total : 0;
    const avgPct = total ? results.reduce((acc, r) => acc + r.score.percentage, 0) / total : 0;
    const scores = results.map(r => r.score.total);

    const analytics = {
      totalStudents: total,
      averageScore: avgScore,
      averagePercentage: avgPct,
      highestScore: Math.max(...scores, 0),
      lowestScore: Math.min(...scores, 0),
      passedStudents: results.filter(r => r.score.percentage >= 40).length,
      scoreDistribution: {
        '90-100': results.filter(r => r.score.percentage >= 90).length,
        '80-89': results.filter(r => r.score.percentage >= 80 && r.score.percentage < 90).length,
        '70-79': results.filter(r => r.score.percentage >= 70 && r.score.percentage < 80).length,
        '60-69': results.filter(r => r.score.percentage >= 60 && r.score.percentage < 70).length,
        '50-59': results.filter(r => r.score.percentage >= 50 && r.score.percentage < 60).length,
        '40-49': results.filter(r => r.score.percentage >= 40 && r.score.percentage < 50).length,
        'Below 40': results.filter(r => r.score.percentage < 40).length
      }
    };

    return { status: 200, jsonBody: analytics };
  }
});
