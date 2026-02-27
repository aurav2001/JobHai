const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['jobseeker', 'employer', 'admin'], default: 'jobseeker' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    resumeUrl: { type: String, default: '' },
    googleId: { type: String },
    isVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    emailVerifyExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isActive: { type: Boolean, default: true },
    // Employer-specific
    companyName: { type: String, default: '' },
    companyLogo: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    companyDescription: { type: String, default: '' },
    companySize: { type: String, default: '' },
    industry: { type: String, default: '' },
    // Jobseeker-specific
    experience: { type: String, default: '' },
    education: { type: String, default: '' },
    currentSalary: { type: Number },
    expectedSalary: { type: Number },
    noticePeriod: { type: String, default: '' },
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    // Jobseeker job preferences (collected at signup)
    jobPreferences: {
      desiredJobTitle: { type: String, default: '' },
      jobType: { type: String, enum: ['', 'full-time', 'part-time', 'contract', 'internship', 'freelance'], default: '' },
      preferredLocation: { type: String, default: '' },
      experienceLevel: { type: String, enum: ['', 'fresher', '1-3 years', '3-5 years', '5-10 years', '10+ years'], default: '' },
      expectedSalary: { type: String, default: '' },
      skills: [{ type: String }],
      industry: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerifyToken;
  delete obj.resetPasswordToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
