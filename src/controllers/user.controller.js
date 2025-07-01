const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const crypto = require('crypto');
const { sendOnboardingEmail, sendPasswordResetEmail } = require('../utils/emailClient');

const createUser = async (userData) => {
  const {
    name,
    email,
    password,
    role,
    mobile,
    permissions = [],
    instituteId,
    batchId,
    center,
    profileImageUrl,
    studentDetails
  } = userData;

  if (!name || !email || !password || !role || !mobile) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }

  if (['student', 'trainer', 'centeradmin'].includes(role) && !center) {
    const err = new Error('Center is required for this role');
    err.status = 400;
    throw err;
  }

  if (role === 'student' && (!instituteId || !batchId)) {
    const err = new Error('instituteId and batchId are required for student role');
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('User with this email already exists');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    passwordHash,
    role,
    mobile,
    permissions,
    instituteId: instituteId || null,
    batchId: batchId || null,
    center: center || null,
    profileImageUrl: profileImageUrl || '',
    studentDetails: role === 'student' ? studentDetails || {} : undefined
  });

  await newUser.save();

  await sendOnboardingEmail({ toEmail: email, name, role, password });

  return {
    message: 'User created and email sent (if possible)',
    userId: newUser._id
  };
};

const getAllUsers = async (filterParams = {}) => {
  const { role } = filterParams;
  const query = {};
  if (role) query.role = role;

  const users = await User.find(query).select('-passwordHash');
  return {
    count: users.length,
    users
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('-passwordHash');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

const updateUser = async (id, updateData) => {
  if (updateData.password) {
    updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
    delete updateData.password;
  }

  // Optional: Prevent role-based fields from being set incorrectly
  if (updateData.role === 'student' && !updateData.studentDetails) {
    updateData.studentDetails = {};
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).select('-passwordHash');

  if (!updatedUser) {
    const err = new Error('User not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedUser;
};

const importUsersFromExcel = async (file, { role, password, instituteId, batchId, center }) => {
  const workbook = XLSX.readFile(file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const users = XLSX.utils.sheet_to_json(sheet);

  if (!users || users.length === 0) {
    throw new Error('No user data found in Excel file');
  }

  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 10);

  const newUsers = [];
  const updateOps = [];
  const emailTasks = [];

  for (const { name, email, mobile } of users) {
    if (!name || !email || !mobile) continue;

    const existing = await User.findOne({ email });
    const baseFields = {
      name,
      email,
      passwordHash,
      role,
      mobile,
      batchId: batchId || null,
      instituteId: instituteId || null,
      center: ['student', 'trainer', 'centeradmin'].includes(role) ? center || null : undefined,
      isActive: true,
      updatedAt: now,
      lastLoginAt: now
    };

    if (existing) {
      updateOps.push({
        updateOne: {
          filter: { email },
          update: { $set: baseFields }
        }
      });
    } else {
      newUsers.push({
        ...baseFields,
        createdAt: now
      });
    }

    emailTasks.push({ toEmail: email, name, role, password });
  }

  if (newUsers.length) await User.insertMany(newUsers, { ordered: false });
  if (updateOps.length) await User.bulkWrite(updateOps, { ordered: false });

  setTimeout(() => {
    Promise.allSettled(emailTasks.map(data => sendOnboardingEmail(data)))
      .then(results => console.log('Emails sent:', results.length))
      .catch(err => console.error('Email sending failed:', err));
  }, 0);

  return {
    message: 'User import completed',
    createdCount: newUsers.length,
    updatedCount: updateOps.length
  };
};

const forgotPassword = async (email) => {
  if (!email) {
    const err = new Error('Email is required');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ email });
  const genericResponse = { message: 'If this email exists, a reset link has been sent.' };

  if (!user) return genericResponse;

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail({ toEmail: email, name: user.name, resetLink });

  return genericResponse;
};

const resetPassword = async (token, password) => {
  if (!token || !password) {
    const err = new Error('Token and new password are required');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    const err = new Error('Token is invalid or has expired');
    err.status = 400;
    throw err;
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: 'Password reset successful' };
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  importUsersFromExcel,
  forgotPassword,
  resetPassword
};
