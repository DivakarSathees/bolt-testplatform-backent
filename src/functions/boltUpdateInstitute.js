const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const Center = require('../boltmodels/Institute');
const { auth, authorize } = require('../middleware/auth');

app.http('boltUpdateInstitute', {
  methods: ['PUT'],
  route: 'centers/{id}',
  authLevel: 'anonymous',
  handler: async (req) => {
    await connectDB();
    const authResult = await auth(req);
    if (!authResult.authorized) return authResult.response;

    const roleCheck = authorize(['superadmin', 'centeradmin'], authResult.user);
    if (!roleCheck.authorized) return roleCheck.response;

    const centerId = req.params.id;

    if (
      authResult.user.role === 'centeradmin' &&
      authResult.user.center.toString() !== centerId
    ) {
      return { status: 403, jsonBody: { message: 'Access denied' } };
    }

    try {
      const updated = await Center.findByIdAndUpdate(
        centerId,
        req.body,
        { new: true, runValidators: true }
      ).populate('admin', 'name email');

      if (!updated) {
        return { status: 404, jsonBody: { message: 'Center not found' } };
      }

      return {
        status: 200,
        jsonBody: {
          message: 'Center updated successfully',
          center: updated
        }
      };
    } catch (error) {
      return {
        status: 500,
        jsonBody: { message: 'Server error', error }
      };
    }
  }
});
