const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const Center = require('../boltmodels/Institute');
const { auth, authorize } = require('../middleware/auth');

app.http('boltCreateInstitute', {
  methods: ['POST'],
  route: 'centers',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const roleCheck = authorize(['superadmin'], authResult.user);
    if (!roleCheck.authorized) return roleCheck.response;


    
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return {
        status: 400,
        jsonBody: { message: 'Invalid JSON body' }
      };
    }

    const { name, code, ...rest } = body || {};
    console.log('Request body:', req);
    

    if (!name || name.trim().length < 2 || !code || code.trim().length < 2) {
      return {
        status: 400,
        jsonBody: {
          message: 'Validation failed',
          errors: [
            ...(name?.trim().length < 2 ? [{ msg: 'Name must be at least 2 characters' }] : []),
            ...(code?.trim().length < 2 ? [{ msg: 'Code must be at least 2 characters' }] : []),
            ...(Object.keys(rest).length === 0 ? [{ msg: 'At least one additional field is required' }] : [])

          ]
        }
      };
    }

    try {
      const center = new Center({ name, code, ...rest });
      await center.save();

      return {
        status: 201,
        jsonBody: {
          message: 'Center created successfully',
          center
        }
      };
    } catch (error) {
      if (error.code === 11000) {
        return {
          status: 400,
          jsonBody: { message: 'Center code already exists' }
        };
      }
      return {
        status: 500,
        jsonBody: { message: 'Server error', error }
      };
    }
  }
});
