const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { auth, authorize } = require('../middleware/auth');
const Result = require('../boltmodels/Result');
const Test = require('../boltmodels/Test');

app.http('submitResult', {
  methods: ['POST'],
  route: 'results/submit',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();

    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['student', 'superadmin'], authResult.user);
    if (!perms.authorized) return perms.response;

    try {
      const { testId, answers, timeTaken, startTime, endTime } = req.body;

      const existing = await Result.findOne({ student: authResult.user._id, test: testId });
      if (existing) return { status: 400, jsonBody: { message: 'Test already submitted' } };

      const test = await Test.findById(testId).populate('questions');
      if (!test) return { status: 404, jsonBody: { message: 'Test not found' } };

      let totalMarks = 0, correct = 0, incorrect = 0, unattempted = 0;
      const subjectWise = {};
      const processed = answers.map(a => {
        const q = test.questions.find(q => q._id.toString() === a.questionId);
        if (!q) return null;

        const isCorrect = a.selectedAnswer === q.correctAnswer;
        let marksObtained = 0;

        if (a.selectedAnswer) {
          if (isCorrect) { marksObtained = q.marks; correct++; }
          else { marksObtained = -q.negativeMarks; incorrect++; }
        } else {
          unattempted++;
        }
        totalMarks += marksObtained;

        subjectWise[q.subject] = subjectWise[q.subject] || { subject: q.subject, correct: 0, incorrect: 0, unattempted: 0, marks: 0 };
        if (a.selectedAnswer) {
          isCorrect ? subjectWise[q.subject].correct++ : subjectWise[q.subject].incorrect++;
        } else subjectWise[q.subject].unattempted++;
        subjectWise[q.subject].marks += marksObtained;

        return {
          question: q._id,
          selectedAnswer: a.selectedAnswer,
          isCorrect,
          marksObtained,
          timeSpent: a.timeSpent || 0
        };
      }).filter(Boolean);

      const percentage = test.totalMarks ? (totalMarks / test.totalMarks) * 100 : 0;

      const result = new Result({
        student: authResult.user._id,
        test: testId,
        answers: processed,
        score: {
          total: totalMarks,
          correct,
          incorrect,
          unattempted,
          percentage: Math.max(0, percentage)
        },
        timeTaken,
        startTime,
        endTime,
        subjectWiseScore: Object.values(subjectWise)
      });

      await result.save();

      const allResults = await Result.find({ test: testId }).sort({ 'score.total': -1 });
      const rank = allResults.findIndex(r => r._id.toString() === result._id.toString()) + 1;
      result.rank = { overall: rank };
      await result.save();

      return { status: 201, jsonBody: { message: 'Test submitted successfully', result } };
    } catch (e) {
      console.error(e);
      return { status: 500, jsonBody: { message: 'Server error', error: e } };
    }
  }
});
