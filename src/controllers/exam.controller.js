const Exam = require('../models/exam.model');
const Subject = require('../models/subject.model');
const Chapter = require('../models/chapter.model');

// Create a new exam
const createExam = async (data) => {
  const { name, instituteId, createdBy, lastUpdatedBy } = data;

  if (!name || !createdBy) {
    const err = new Error('Missing required fields: name or createdBy');
    err.status = 400;
    throw err;
  }

  const exam = new Exam({
    name,
    instituteId: instituteId || [],
    createdBy,
    lastUpdatedBy
  });

  await exam.save();

  return {
    message: 'Exam created successfully',
    examId: exam._id
  };
};

// Get all exams (including inactive)
const getAllExams = async () => {
  const exams = await Exam.find();
  return exams;
};

// Get a single exam by ID
const getExamById = async (id) => {
  const exam = await Exam.findById(id);
  if (!exam) {
    const err = new Error('Exam not found');
    err.status = 404;
    throw err;
  }
  return exam;
};

// Update an exam
const updateExam = async (id, updateData) => {
  updateData.updatedAt = new Date();

  const updatedExam = await Exam.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedExam) {
    const err = new Error('Exam not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedExam;
};

// fetche exams with subjects and chapters
const getExamsWithSubjectsAndChapters = async () => {
  const exams = await Exam.find();
  const examsWithDetails = await Promise.all(exams.map(async (exam) => {
    const subjects = await Subject.find({ examId: exam._id });
    const subjectsWithChapters = await Promise.all(subjects.map(async (subject) => {
      const chapters = await Chapter.find({ subjectId: subject._id });
      return {
        ...subject.toObject(),
        chapters
      };
    }));
    return {
      ...exam.toObject(),
      subjects: subjectsWithChapters
    };
  }));
  return examsWithDetails;
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  getExamsWithSubjectsAndChapters
};
