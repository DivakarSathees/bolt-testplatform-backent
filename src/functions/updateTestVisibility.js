const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { updateTestVisibility } = require('../controllers/testVisibility.controller');
const { verifyToken } = require('../middleware/auth.middleware');

app.http('updateTestVisibility', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'test-visibility/update/{id}',
  handler: async (request, context) => {
    try {
      await connectDB();
      const user = verifyToken(request);

      const id = context.request.params.id;
      const body = await request.json();
      body.lastUpdatedBy = user.userId;

      const updated = await updateTestVisibility(id, body);
      return { status: 200, jsonBody: updated };
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { error: err.message || 'Something went wrong' }
      };
    }
  }
});
