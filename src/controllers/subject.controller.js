const Subject = require('../models/subject.model');
const XLSX = require('xlsx');

// Create Subject
const createSubject = async (data) => {
  const { name, examId, instituteId, createdBy, lastUpdatedBy } = data;

  if (!name || !examId || !createdBy) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }

  const newSubject = new Subject({
    name,
    examId,
    instituteId: instituteId || [],
    createdBy,
    lastUpdatedBy
  });

  await newSubject.save();

  return {
    message: 'Subject created successfully',
    subjectId: newSubject._id
  };
};

// Get All Subjects
const getAllSubjects = async () => {
  return await Subject.find();
};

// Get Subject By ID
const getSubjectById = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) {
    const err = new Error('Subject not found');
    err.status = 404;
    throw err;
  }
  return subject;
};

// Update Subject
const updateSubject = async (id, updateData) => {
  updateData.updatedAt = new Date();

  const updatedSubject = await Subject.findByIdAndUpdate(id, updateData, {
    new: true
  });

  if (!updatedSubject) {
    const err = new Error('Subject not found or update failed');
    err.status = 404;
    throw err;
  }

  return updatedSubject;
};

const importSubjectsFromExcel = async (file, { examId, instituteIds = [], createdBy }) => {
  const workbook = XLSX.readFile(file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const subjects = XLSX.utils.sheet_to_json(sheet);

  if (!subjects || subjects.length === 0) {
    throw new Error('No subject data found in Excel file');
  }

  const now = new Date();
  const newSubjects = [];

  for (const { name } of subjects) {
    if (!name) continue;

    newSubjects.push({
      name: name.trim(),
      examId,
      instituteId: instituteIds,
      createdBy,
      lastUpdatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isActive: true
    });
  }

  try {
    const inserted = await Subject.insertMany(newSubjects, { ordered: false });
    return {
      message: 'Subject import completed',
      createdCount: inserted.length,
      skipped: newSubjects.length - inserted.length
    };
  } catch (err) {
    if (err.code === 11000) {
      return {
        message: 'Subject import partially completed',
        createdCount: err.result?.nInserted || 0,
        skipped: newSubjects.length - (err.result?.nInserted || 0),
        error: 'Some duplicate entries were skipped'
      };
    }
    throw err;
  }
};

// get subjects by examid
const getSubjectsByExamId = async (examId) => {
  if (!examId) {
    const err = new Error('Exam ID is required');
    err.status = 400;
    throw err;
  }

  const subjects = await Subject.find({ examId });
  if (!subjects || subjects.length === 0) {
    const err = new Error('No subjects found for this exam');
    err.status = 404;
    throw err;
  }

  return subjects;
};



module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  importSubjectsFromExcel,
  getSubjectsByExamId
};
