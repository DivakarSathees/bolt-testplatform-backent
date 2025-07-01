const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const {
  signAccessToken,
  signRefreshToken
} = require('../utils/jwt');

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ email });

  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('User account is deactivated');
    err.status = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  return {
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      instituteId: user.instituteId,
      batchId: user.batchId,
      // center: user.center,
      profileImageUrl: user.profileImageUrl || '',
      studentDetails: user.role === 'student' ? user.studentDetails || {} : undefined
    }
  };
};

const authMe = async (userId) => {
  if (!userId) {
    const err = new Error('User ID is required');
    err.status = 400;
    throw err;
  }
  const user = await User.findById(userId)
    .select('-password')
    .populate('instituteId', 'name')
    .populate('batchId', 'name');

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return {
    message: 'User authenticated successfully',
    user: user
  };
}



module.exports = { loginUser, authMe };
