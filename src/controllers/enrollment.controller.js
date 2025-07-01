const Enrollment = require('../models/enrollment.model');

// Create Enrollment
const createEnrollment = async (data) => {
  const { batchId, courseId, createdBy, lastUpdatedBy } = data;

  if (!batchId || !courseId || !createdBy) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }

  const enrollment = new Enrollment({
    batchId,
    courseId,
    createdBy,
    lastUpdatedBy
  });

  await enrollment.save();

  return {
    message: 'Enrollment created successfully',
    enrollmentId: enrollment._id
  };
};

// Get All Enrollments
const getAllEnrollments = async () => {
  return await Enrollment.find();
};

// Get Enrollment by ID
const getEnrollmentById = async (id) => {
  const enrollment = await Enrollment.findById(id);
  if (!enrollment) {
    const err = new Error('Enrollment not found');
    err.status = 404;
    throw err;
  }
  return enrollment;
};

// Update Enrollment
const updateEnrollment = async (id, updateData) => {
  updateData.updatedAt = new Date();

  const updated = await Enrollment.findByIdAndUpdate(id, updateData, {
    new: true
  });

  if (!updated) {
    const err = new Error('Enrollment not found or update failed');
    err.status = 404;
    throw err;
  }

  return updated;
};

module.exports = {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment
};
