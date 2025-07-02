const QuestionSet = require('../models/questionSet.model');
const XLSX = require('xlsx');

// Create QuestionSet
const createQuestionSet = async (data) => {
  const { name, examId, subjectId, chapterId, instituteId, createdBy, lastUpdatedBy } = data;

  if (!name || !examId || !subjectId || !chapterId || !createdBy) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }

  const newSet = new QuestionSet({
    name,
    examId,
    subjectId,
    chapterId,
    instituteId: instituteId || [],
    createdBy,
    lastUpdatedBy
  });

  await newSet.save();

  return {
    message: 'Question Set created successfully',
    questionSetId: newSet._id
  };
};

// Get All Question Sets
const getAllQuestionSets = async () => {
  return await QuestionSet.find();
};

// Get Question Set By ID
const getQuestionSetById = async (id) => {
  const questionSet = await QuestionSet.findById(id);
  if (!questionSet) {
    const err = new Error('Question Set not found');
    err.status = 404;
    throw err;
  }
  return questionSet;
};

// Update Question Set
const updateQuestionSet = async (id, updateData) => {
  updateData.updatedAt = new Date();

  const updated = await QuestionSet.findByIdAndUpdate(id, updateData, {
    new: true
  });

  if (!updated) {
    const err = new Error('Question Set not found or update failed');
    err.status = 404;
    throw err;
  }

  return updated;
};

const importQuestionSetsFromExcel = async (file, { examId, subjectId, chapterId, instituteIds = [], createdBy }) => {
  const workbook = XLSX.readFile(file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const sets = XLSX.utils.sheet_to_json(sheet);

  if (!sets || sets.length === 0) {
    throw new Error('No question set data found in Excel file');
  }

  const now = new Date();
  const newSets = [];

  for (const { name } of sets) {
    if (!name) continue;

    newSets.push({
      name: name.trim(),
      examId,
      subjectId,
      chapterId,
      instituteId: instituteIds,
      createdBy,
      lastUpdatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isActive: true
    });
  }

  try {
    const inserted = await QuestionSet.insertMany(newSets, { ordered: false });
    return {
      message: 'Question set import completed',
      createdCount: inserted.length,
      skipped: newSets.length - inserted.length
    };
  } catch (err) {
    if (err.code === 11000) {
      return {
        message: 'Question set import partially completed',
        createdCount: err.result?.nInserted || 0,
        skipped: newSets.length - (err.result?.nInserted || 0),
        error: 'Some duplicate entries were skipped'
      };
    }
    throw err;
  }
};

// Get all question sets by cgapterId
const getQuestionSetsByChapterId = async (chapterId) => {
  const questionSets = await QuestionSet.find({
    chapterId,
    isActive: true
  });
  if (!questionSets || questionSets.length === 0) {
    const err = new Error('No question sets found for this chapter');
    err.status = 404;
    throw err;
  }
  return questionSets;
};



module.exports = {
  createQuestionSet,
  getAllQuestionSets,
  getQuestionSetById,
  updateQuestionSet,
  importQuestionSetsFromExcel,
  getQuestionSetsByChapterId
};
