const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLE_ENUM = [
  'superadmin',
  'centeradmin',
  'trainer',
  'student',
  'contentadmin'
];

const PERMISSION_ENUM = [
  "*",
  "content:crud:own",
  "content:view:all",
  "content:crud:all"
];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Email format is invalid']
  },
  password: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: {
    type: String,
    enum: {
      values: ROLE_ENUM,
      message: '{VALUE} is not a valid role'
    },
    required: [true, 'Role is required']
  },
  mobile: {
    type: String,
    trim: true,
    match: [/^\+91-\d{10}$/, 'Mobile must be in format +91-xxxxxxxxxx'],
    required: [true, 'Mobile number is required']
  },
  // center: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Center',
  //   required: function () {
  //     return ['student', 'trainer', 'centeradmin'].includes(this.role);
  //   },
  //   default: null
  // },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    default: null
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    default: null
  },
  permissions: {
    type: [String],
    enum: {
      values: PERMISSION_ENUM,
      message: '{VALUE} is not a valid permission'
    },
    default: []
  },
  profileImageUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Invalid URL format'],
    default: ''
  },
  studentDetails: {
    rollNumber: String,
    class: {
      type: String,
      enum: ['11th', '12th', 'Dropper']
    },
    stream: {
      type: String,
      enum: ['PCM', 'PCB', 'PCMB']
    },
    targetExam: {
      type: String,
      enum: ['JEE', 'NEET', 'Both']
    },
    parentName: String,
    parentPhone: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Pre-save hook for hashing plain password (optional if password is passed directly)
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
