const allowedOrigin = 'http://localhost:5173';

/**
 * Wrap a handler function to add CORS support
 */
function withCors(handler, allowedMethods = ['GET', 'POST', 'PUT', 'DELETE']) {
  return async (request, context) => {
    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': allowedMethods.join(', '),
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        },
      };
    }

    const response = await handler(request, context);

    // Ensure headers exist
    response.headers = {
      ...response.headers,
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Credentials': 'true',
    };

    return response;
  };
}

module.exports = { withCors };
