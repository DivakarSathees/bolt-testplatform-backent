const { app } = require('@azure/functions');
const { withCors } = require('../utils/withCors');
const connectDB = require('../utils/db');
const { verifyToken } = require('../middleware/auth.middleware');
const { authMe } = require('../controllers/auth.controller');

async function authMeHandler(request, context) {
  const decodedUser = verifyToken(request);
  await connectDB();
  const result = await authMe(decodedUser.userId);

  return {
    status: 200,
    jsonBody: {
      message: 'User details retrieved successfully',
      data: result,
    },
  };
}

app.http('authMe', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/me',
  handler: withCors(authMeHandler, ['GET']),
});
