const Question = require('../models/question.model');
const XLSX = require('xlsx');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

// Create Question
const createQuestion = async (data) => {
  const { text, options, correctAnswerIndex, explanation, questionSetId, marks, negativeMarks, createdBy, lastUpdatedBy } = data;

  if (!text || !options || options.length < 2 || correctAnswerIndex === undefined || !questionSetId || createdBy === undefined) {
    const err = new Error('Missing or invalid required fields');
    err.status = 400;
    throw err;
  }

  const newQuestion = new Question({
    text,
    options,
    correctAnswerIndex,
    explanation,
    questionSetId,
    marks,
    negativeMarks,
    createdBy,
    lastUpdatedBy
  });

  await newQuestion.save();

  return {
    message: 'Question created successfully',
    questionId: newQuestion._id
  };
};

// Get All Questions
const getAllQuestions = async () => {
  return await Question.find();
};

// Get Question By ID
const getQuestionById = async (id) => {
  const question = await Question.findById(id);
  if (!question) {
    const err = new Error('Question not found');
    err.status = 404;
    throw err;
  }
  return question;
};

// Update Question
const updateQuestion = async (id, updateData) => {
  updateData.updatedAt = new Date();

  const updated = await Question.findByIdAndUpdate(id, updateData, {
    new: true
  });

  if (!updated) {
    const err = new Error('Question not found or update failed');
    err.status = 404;
    throw err;
  }

  return updated;
};


const importQuestionsFromExcel = async (file, { questionSetId, createdBy }) => {
  const workbook = XLSX.readFile(file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  if (!rows || rows.length === 0) {
    throw new Error('No question data found in Excel file');
  }

  const now = new Date();
  const questions = [];

  for (const row of rows) {
    const {
      text,
      option1, option2, option3, option4,
      correctAnswerIndex,
      explanation = '',
      marks = 1,
      negativeMarks = 0
    } = row;

    if (!text || correctAnswerIndex === undefined || !option1 || !option2) continue;

    const options = [option1, option2];
    if (option3) options.push(option3);
    if (option4) options.push(option4);

    questions.push({
      text: text.trim(),
      options,
      correctAnswerIndex: Number(correctAnswerIndex),
      explanation,
      marks: Number(marks),
      negativeMarks: Number(negativeMarks),
      questionSetId,
      createdBy,
      lastUpdatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
      isActive: true
    });
  }

  try {
    const inserted = await Question.insertMany(questions, { ordered: false });
    return {
      message: 'Questions import completed',
      createdCount: inserted.length,
      skipped: questions.length - inserted.length
    };
  } catch (err) {
    if (err.code === 11000 || err.writeErrors) {
      const insertedCount = err.result?.nInserted || 0;
      return {
        message: 'Questions import partially completed',
        createdCount: insertedCount,
        skipped: questions.length - insertedCount,
        error: 'Some duplicate questions were skipped'
      };
    }
    throw err;
  }
};




module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  importQuestionsFromExcel
};
