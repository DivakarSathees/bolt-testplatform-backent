const mongoose = require('mongoose');
const { Schema } = mongoose;

const testSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  questionIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  instituteId: [{
    type: Schema.Types.ObjectId,
    ref: 'Institute'
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

testSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Test', testSchema);
