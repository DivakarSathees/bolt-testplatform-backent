const { app } = require('@azure/functions');
const { loginUser } = require('../controllers/auth.controller');
const connectDB = require('../utils/db');


app.http('loginUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: async (req, context) => {
    try {
      
      await connectDB();
      const body = await req.json();
      console.log('Request body:', body);
      const result = await loginUser(body);

      return {
        status: 200,
        jsonBody: result
      };
    } catch (err) {
      return {
        status: 401,
        jsonBody: { error: err.message }
      };
    }
  }
});
