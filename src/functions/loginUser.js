const { app } = require('@azure/functions');
const { loginUser } = require('../controllers/auth.controller');
const connectDB = require('../utils/db');
const { withCors } = require('../utils/withCors'); // ✅ Import the wrapper

// Your original logic wrapped into a separate handler
async function loginUserHandler(req, context) {
  await connectDB();
  const body = await req.json();
  console.log('Request body:', body);
  const result = await loginUser(body);

  return {
    status: 200,
    jsonBody: result,
  };
}

// Register function using withCors
app.http('loginUser', {
  methods: ['POST', 'OPTIONS'], // Include OPTIONS for preflight
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: withCors(loginUserHandler, ['POST']),
});
