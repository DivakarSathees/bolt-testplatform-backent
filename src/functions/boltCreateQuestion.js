const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
// const { body, validationResult } = require('express-validator');
const Question = require('../boltmodels/Question');
const { auth, authorize } = require('../middleware/auth');

app.http('boltCreateQuestion', {
  methods: ['POST'],
  route: 'questions',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();

    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const perms = authorize(['contentadmin', 'trainer', 'superadmin'], authResult.user);
    if (!perms.authorized) return perms.response;

     let body;
    try {
      body = await req.json();
    } catch (err) {
      return {
        status: 400,
        jsonBody: { message: 'Invalid JSON body' }
      };
    }
    console.log('Request body:', body);


    

    // Manual validation (express-validator not directly usable here)
    const errors = [];
    if (!body.question || body.question.trim().length < 10)
      errors.push({ msg: 'Question must be at least 10 characters', param: 'question' });
    if (!['Physics','Chemistry','Mathematics','Biology'].includes(body.subject))
      errors.push({ msg: 'Invalid subject', param: 'subject' });
    // if (!body.topic || body.topic.trim().length < 2)
    //   errors.push({ msg: 'Topic must be at least 2 characters', param: 'topic' });
    if (!['Easy','Medium','Hard'].includes(body.difficulty))
      errors.push({ msg: 'Invalid difficulty', param: 'difficulty' });
    if (!body.correctAnswer || body.correctAnswer.trim().length < 1)
      errors.push({ msg: 'Correct answer is required', param: 'correctAnswer' });
    if (errors.length) return { status: 400, jsonBody: { errors } };

    try {
      const questionData = {
        ...body,
        createdBy: authResult.user._id
      };
      const question = await Question.create(questionData);

      return { status: 201, jsonBody: { message: 'Question created successfully', question } };
    } catch (error) {
      return { status: 500, jsonBody: { message: 'Server error', error } };
    }
  }
});
