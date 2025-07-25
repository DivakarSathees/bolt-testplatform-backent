const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'At least two options are required']
  },
  correctAnswerIndex: {
    type: Number,
    required: true
  },
  explanation: {
    type: String
  },
  marks: {
    type: Number,
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0
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
questionSchema.index({ text: 1, questionSetId: 1 }, { unique: true });

module.exports = mongoose.model('Question', questionSchema);
