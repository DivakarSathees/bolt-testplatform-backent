const Chapter = require('../models/chapter.model');
const XLSX = require('xlsx');

// Create Chapter
const createChapter = async (data) => {
  const { name, examId, subjectId, instituteId, createdBy, lastUpdatedBy } = data;

  if (!name || !examId || !subjectId || !createdBy) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }

  const newChapter = new Chapter({
    name,
    examId,
    subjectId,
    instituteId: instituteId || [],
    createdBy,
    lastUpdatedBy
  });

  await newChapter.save();

  return {
    message: 'Chapter created successfully',
    chapterId: newChapter._id
  };
};

// Get All Chapters
const getAllChapters = async () => {
  return await Chapter.find();
};

// Get Chapter By ID
const getChapterById = async (id) => {
  const chapter = await Chapter.findById(id);
  if (!chapter) {
    const err = new Error('Chapter not found');
    err.status = 404;
    throw err;
  }
  return chapter;
};

// Update Chapter
const updateChapter = async (id, updateData) => {
  updateData.updatedAt = new Date();

  const updatedChapter = await Chapter.findByIdAndUpdate(id, updateData, {
    new: true
  });

  if (!updatedChapter) {
    const err = new Error('Chapter not found or update failed');
    err.status = 404;
    throw err;
  }

  return updatedChapter;
};

const importChaptersFromExcel = async (file, { examId, subjectId, createdBy }) => {
  const workbook = XLSX.readFile(file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  if (!rows || rows.length === 0) {
    throw new Error('No chapter data found in Excel file');
  }

  const now = new Date();
  const newChapters = [];

  for (const { name } of rows) {
    if (!name) continue;

    newChapters.push({
      name: name.trim(),
      examId,
      subjectId,
      createdBy,
      lastUpdatedBy: createdBy,
      isActive: true,
      createdAt: now,
      updatedAt: now
    });
  }

  try {
    const inserted = await Chapter.insertMany(newChapters, { ordered: false });
    return {
      message: 'Chapter import completed',
      createdCount: inserted.length,
      skipped: newChapters.length - inserted.length
    };
  } catch (err) {
    if (err.code === 11000) {
      return {
        message: 'Chapter import partially completed',
        createdCount: err.result?.nInserted || 0,
        error: 'Some duplicate entries were skipped'
      };
    }
    throw err;
  }
};


module.exports = {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  importChaptersFromExcel
};
