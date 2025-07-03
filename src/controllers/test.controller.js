// const Test = require('../models/test.model');
const Test = require('../boltmodels/Test');

// Create Test
const createTest = async (data) => {
  const { name, questionIds, instituteId, createdBy, lastUpdatedBy } = data;

  if (!name || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0 || !createdBy) {
    const err = new Error('Missing or invalid required fields');
    err.status = 400;
    throw err;
  }

  const newTest = new Test({
    name,
    questionIds,
    instituteId: instituteId || [],
    createdBy,
    lastUpdatedBy
  });

  await newTest.save();

  return {
    message: 'Test created successfully',
    testId: newTest._id
  };
};

// Get All Tests
const getAllTests = async () => {
  return await Test.find();
};

// Get Test By ID
const getTestById = async (id) => {
  const test = await Test.findById(id);
  if (!test) {
    const err = new Error('Test not found');
    err.status = 404;
    throw err;
  }
  return test;
};

// Update Test
const updateTest = async (id, updateData) => {
  updateData.updatedAt = new Date();
  console.log('Update Data:', updateData);
  

  const updated = await Test.findByIdAndUpdate(id, updateData, {
    new: true
  });

  if (!updated) {
    const err = new Error('Test not found or update failed');
    err.status = 404;
    throw err;
  }

  return updated;
};

module.exports = {
  createTest,
  getAllTests,
  getTestById,
  updateTest
};
