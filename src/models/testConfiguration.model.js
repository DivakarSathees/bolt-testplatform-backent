const mongoose = require('mongoose');
const { Schema } = mongoose;

const testConfigurationSchema = new Schema({
  testId: {
    type: Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  durationInMinutes: {
    type: Number,
    required: true
  },
  maxAttempts: {
    type: Number,
    default: 1
  },
  isRetakeAllowed: {
    type: Boolean,
    default: false
  },
  isCopyPasteAllowed: {
    type: Boolean,
    default: false
  },
  isPreparationTest: {
    type: Boolean,
    default: false
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

testConfigurationSchema.index({ testId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('TestConfiguration', testConfigurationSchema);
