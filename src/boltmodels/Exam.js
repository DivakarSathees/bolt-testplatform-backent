const mongoose = require('mongoose');
const { Schema } = mongoose;

const examSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true,
    unique: true
  },
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
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
