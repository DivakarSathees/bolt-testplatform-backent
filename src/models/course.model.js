const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  instituteId: [{
    type: Schema.Types.ObjectId,
    ref: 'Institute'
  }],
  testIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Test'
  }],
  enrolledBatch: [{
    type: Schema.Types.ObjectId,
    ref: 'Batch'
  }],
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

courseSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
