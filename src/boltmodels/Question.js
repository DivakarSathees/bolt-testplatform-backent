const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['MCQ', 'Numerical', 'True/False'],
    default: 'MCQ'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    trim: true
  },
  marks: {
    type: Number,
    default: 4
  },
  negativeMarks: {
    type: Number,
    default: 1
  },
  image: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  questionSetId: {
    type: Schema.Types.ObjectId,
    ref: 'QuestionSet',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

questionSchema.index({ question: 1, questionSetId: 1 }, { unique: true });

module.exports = mongoose.model('Questions', questionSchema);
