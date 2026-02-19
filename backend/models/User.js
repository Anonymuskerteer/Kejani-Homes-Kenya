const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  role: {
    type: String,
    enum: ['tenant', 'landlord', 'agency', 'admin'],
    default: 'tenant'
  },
  tenantCounty: {
    type: String,
    enum: [
      'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Calibri', 'Embu', 'Garissa',
      'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu',
      'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
      'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori',
      'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok',
      'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta',
      'Tana River', 'Transnzoia', 'Turkana', 'Tharaka Nithi', 'Uasin Gishu',
      'Vihiga', 'Wajir', 'West Pokot'
    ]
  },
  tenantPhone: {
    type: String,
    match: [/^\+?254\d{9}$|^0\d{9}$/, 'Please enter a valid Kenyan phone number'],
    unique: true,
    sparse: true
  },
  agencyName: {
    type: String,
    maxlength: [100, 'Agency name cannot exceed 100 characters']
  },
  registrationNumber: {
    type: String,
    maxlength: [50, 'Registration number cannot exceed 50 characters']
  },
  registrationDate: {
    type: Date
  },
  companyLogo: {
    type: String
  },
  landlordProfilePhoto: {
    type: String
  },
  pendingProfilePhoto: {
    type: String,
    default: null
  },
  profilePhotoStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  landlordEmail: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  landlordPhone: {
    type: String,
    match: [/^\+?254\d{9}$|^0\d{9}$/, 'Please enter a valid Kenyan phone number'],
    unique: true,
    sparse: true
  },
  landlordCounty: {
    type: String,
    enum: [
      'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Calibri', 'Embu', 'Garissa',
      'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu',
      'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
      'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori',
      'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok',
      'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta',
      'Tana River', 'Transnzoia', 'Turkana', 'Tharaka Nithi', 'Uasin Gishu',
      'Vihiga', 'Wajir', 'West Pokot'
    ]
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: null
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // OTP verification fields
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  otpToken: {
    type: String
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );
};

userSchema.methods.generateEmailVerificationToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      type: 'emailVerification' 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

userSchema.methods.generatePasswordResetToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      type: 'passwordReset' 
    },
    process.env.JWT_SECRET,
    { expiresIn: '15min' }
  );
};

userSchema.methods.generateOTP = function() {
  // Generate a 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  // Generate a token for OTP verification
  const otpToken = jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      type: 'otpVerification' 
    },
    process.env.JWT_SECRET,
    { expiresIn: '10min' }
  );
  
  const expires = Date.now() + 600000; // 10 minutes
  
  this.otp = otp;
  this.otpToken = otpToken;
  this.otpExpires = new Date(expires);
  
  return { otp, otpToken };
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.otp;
  delete user.otpExpires;
  delete user.otpToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);
