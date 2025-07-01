const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { createInstitute } = require('../controllers/institute.controller');

app.http('createInstitute', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'institute/create',
  handler: async (request, context) => {
    try {
      // const decodedUser = verifyToken(request);
      // context.log('Authenticated user:', decodedUser);
      await connectDB();

      const body = await request.json(); // read JSON payload

      const result = await createInstitute(body);

      return {
        status: 201,
        jsonBody: {
          message: 'Institute created successfully',
          data: result
        }
      };
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: {
          error: err.message || 'Something went wrong'
        }
      };
    }
  }
});
