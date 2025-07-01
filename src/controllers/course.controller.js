const Course = require('../models/course.model');

// Create Course
const createCourse = async (data) => {
  const { name, instituteId, testIds, enrolledBatch, createdBy, lastUpdatedBy } = data;

  if (!name || !createdBy) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }

  const newCourse = new Course({
    name,
    instituteId: instituteId || [],
    testIds: testIds || [],
    enrolledBatch: enrolledBatch || [],
    createdBy,
    lastUpdatedBy
  });

  await newCourse.save();

  return {
    message: 'Course created successfully',
    courseId: newCourse._id
  };
};

// Get All Courses
const getAllCourses = async () => {
  return await Course.find();
};

// Get Course By ID
const getCourseById = async (id) => {
  const course = await Course.findById(id);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return course;
};

// Update Course
const updateCourse = async (id, updateData) => {
  updateData.updatedAt = new Date();

  const updated = await Course.findByIdAndUpdate(id, updateData, {
    new: true
  });

  if (!updated) {
    const err = new Error('Course not found or update failed');
    err.status = 404;
    throw err;
  }

  return updated;
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse
};
