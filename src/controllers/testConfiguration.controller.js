const TestConfiguration = require('../models/testConfiguration.model');

// Create Test Configuration
const createTestConfiguration = async (data) => {
  const {
    testId, courseId, startTime, endTime, durationInMinutes,
    maxAttempts, isRetakeAllowed, isCopyPasteAllowed, isPreparationTest,
    createdBy, lastUpdatedBy
  } = data;

  if (!testId || !courseId || !startTime || !endTime || !durationInMinutes || !createdBy) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }

  const newConfig = new TestConfiguration({
    testId,
    courseId,
    startTime,
    endTime,
    durationInMinutes,
    maxAttempts,
    isRetakeAllowed,
    isCopyPasteAllowed,
    isPreparationTest,
    createdBy,
    lastUpdatedBy
  });

  await newConfig.save();

  return {
    message: 'Test Configuration created successfully',
    configId: newConfig._id
  };
};

// Get All Configurations
const getAllTestConfigurations = async () => {
  return await TestConfiguration.find();
};

// Get Configuration by ID
const getTestConfigurationById = async (id) => {
  const config = await TestConfiguration.findById(id);
  if (!config) {
    const err = new Error('Test Configuration not found');
    err.status = 404;
    throw err;
  }
  return config;
};

// Update Configuration
const updateTestConfiguration = async (id, updateData) => {
  updateData.updatedAt = new Date();

  const updated = await TestConfiguration.findByIdAndUpdate(id, updateData, {
    new: true
  });

  if (!updated) {
    const err = new Error('Test Configuration not found or update failed');
    err.status = 404;
    throw err;
  }

  return updated;
};

module.exports = {
  createTestConfiguration,
  getAllTestConfigurations,
  getTestConfigurationById,
  updateTestConfiguration
};
