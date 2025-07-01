const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { createBatch } = require('../controllers/batch.controller');

app.http('createBatch', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'batch/create',

  handler: async (request, context) => {
    try {
      // const decodedUser = verifyToken(request);
      // context.log('Authenticated user:', decodedUser);

      await connectDB();

      const body = await request.json();

      const result = await createBatch(body);

      return {
        status: 201,
        jsonBody: {
          message: 'Batch created successfully',
          data: result
        }
      };
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { error: err.message || 'Something went wrong' }
      };
    }
  }
});
