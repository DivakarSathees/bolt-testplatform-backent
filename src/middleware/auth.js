const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ message: 'No token, authorization denied' });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('-password');
    
//     if (!user) {
//       return res.status(401).json({ message: 'Token is not valid' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };

const auth = async (req) => {
  try {
    // console.log(req.headers);
    
  const authHeader = req.headers.get('authorization');
    // const token = authHeader?.replace('Bearer ', '');
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Authorization token missing or malformed');
    err.status = 401;
    throw err;
  }
    // console.log(authHeader, token);
    
  const token = authHeader.split(' ')[1];

    if (!token) {
      return {
        authorized: false,
        response: {
          status: 401,
          jsonBody: { message: 'No token, authorization denied' }
        }
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return {
        authorized: false,
        response: {
          status: 401,
          jsonBody: { message: 'Token is not valid' }
        }
      };
    }

    return {
      authorized: true,
      user
    };
  } catch (error) {
    return {
      authorized: false,
      response: {
        status: 401,
        jsonBody: { message: 'Token is not valid', error: error.message },

      }
    };
  }
};

// Role-based authorization middleware
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Access denied' });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Insufficient permissions' });
//     }

//     next();
//   };
// };

const authorize = (roles = [], user) => {
  if (!user) {
    return {
      authorized: false,
      response: {
        status: 401,
        jsonBody: { message: 'Access denied' }
      }
    };
  }

  if (!roles.includes(user.role)) {
    return {
      authorized: false,
      response: {
        status: 403,
        jsonBody: { message: 'Insufficient permissions' }
      }
    };
  }

  return {
    authorized: true
  };
};
module.exports = { auth, authorize };