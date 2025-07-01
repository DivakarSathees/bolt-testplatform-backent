const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const { verifyToken } = require('../middleware/auth.middleware');
const { authMe } = require('../controllers/auth.controller');

app.http('authMe', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/me',

  handler: async (request, context) => {
    try {
        // console.log('AuthMe request received:', request);
        
      const decodedUser = verifyToken(request);
    //   context.log('Authenticated user:', decodedUser);

      await connectDB();

    //   const body = await request.json();

      const result = await authMe(decodedUser.userId);
        return {
            status: 200,
            jsonBody: {
            message: 'User details retrieved successfully',
            data: result
            }
        };

    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { error: err.message || 'Something went wrong' }
      };
    }
}});
    