const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Known disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'yopmail.com', 'trashmail.com', 'getnada.com',
  'sharklasers.com', 'spam4.me', 'grr.la', 'maildrop.cc', 'fakeinbox.com',
  'tempr.email', 'dispostable.com', 'mintemail.com', 'spamgourmet.com',
  'mohmal.com', 'tempail.com', 'emailondeck.com', 'fake-email.com'
];

// Validate Kenyan phone number format
const validateKenyanPhone = (phone) => {
  if (!phone) return { valid: true }; // Phone is optional
  
  // Remove any spaces or dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Check if it starts with +254 or 0
  if (!/^(\+254|0)/.test(cleanPhone)) {
    return { valid: false, message: 'Phone number must be a Kenyan number (+254 or 0 prefix)' };
  }
  
  // Convert to standard format
  let formattedPhone = cleanPhone;
  if (cleanPhone.startsWith('0')) {
    formattedPhone = '+254' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('254')) {
    formattedPhone = '+254' + cleanPhone.substring(3);
  }
  
  // Check if it has exactly 9 digits after +254
  if (!/^\+254\d{9}$/.test(formattedPhone)) {
    return { valid: false, message: 'Kenyan phone number must have 9 digits after +254' };
  }
  
  // Check the prefix is valid for Kenyan carriers
  const validPrefixes = ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'];
  const numberPrefix = formattedPhone.substring(3, 5);
  
  if (!validPrefixes.includes(numberPrefix)) {
    return { valid: false, message: 'Invalid Kenyan phone number prefix' };
  }
  
  return { valid: true, formatted: formattedPhone };
};

// Validate email is not disposable
const validateEmail = (email) => {
  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1];
  
  // Check if it's a disposable email
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, message: 'Temporary/disposable emails are not allowed. Please use a permanent email address.' };
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLower)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

// Check for duplicate phone in database
const checkDuplicatePhone = async (phone, role) => {
  if (!phone) return { valid: true };
  
  // For tenant, check tenantPhone
  if (role === 'tenant') {
    const existing = await User.findOne({ tenantPhone: phone });
    if (existing) {
      return { valid: false, message: 'This phone number is already registered' };
    }
  } else {
    // For landlord/agency, check landlordPhone
    const existing = await User.findOne({ landlordPhone: phone });
    if (existing) {
      return { valid: false, message: 'This phone number is already registered' };
    }
  }
  return { valid: true };
};

exports.register = async (req, res) => {
  try {
    console.log('Registration request body:', JSON.stringify(req.body));
    const { email, tenantPhone, landlordPhone, role } = req.body;
    
    // Validate email format and check for disposable emails
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }
    
    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    
    // Validate phone number based on role
    const phoneToValidate = role === 'tenant' ? tenantPhone : landlordPhone;
    if (phoneToValidate) {
      // Validate phone format
      const phoneValidation = validateKenyanPhone(phoneToValidate);
      if (!phoneValidation.valid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
      
      // Check for duplicate phone
      const phoneCheck = await checkDuplicatePhone(phoneValidation.formatted || phoneToValidate, role);
      if (!phoneCheck.valid) {
        return res.status(400).json({ message: phoneCheck.message });
      }
    }

    const user = new User(req.body);
    
    const emailVerificationToken = user.generateEmailVerificationToken();
    const expires = Date.now() + 3600000; // 1 hour
    
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = new Date(expires);
    
    try {
      await user.save();
    } catch (saveError) {
      console.error('User save error:', saveError.message);
      console.error('Validation errors:', saveError.errors);
      return res.status(400).json({ message: saveError.message, errors: saveError.errors });
    }

    // Generate OTP for email verification
    const { otp, otpToken } = user.generateOTP();
    await user.save();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    
    console.log('Sending verification email to:', email);
    console.log('Verification OTP:', otp);
    console.log('Verification URL:', verificationUrl);
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email address - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to KEJANI HOMES!</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>Please enter this code on the verification page to activate your account.</p>
          <p>If you didn't create this account, you can ignore this email.</p>
        </div>
        <p> Made with love by Neon Hub Code House</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', email);
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email for the verification code.',
      userId: user._id,
      otpToken: otpToken // Send token to frontend for OTP verification
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    if (!user.isEmailVerified) {
      // Generate OTP for unverified users who try to login
      let otpToken = user.otpToken;
      
      // Check if there's a valid existing OTP
      if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
        // Generate new OTP
        const { otp, otpToken: newToken } = user.generateOTP();
        otpToken = newToken;
        // Save without validation to avoid issues with incomplete user data
        await user.save({ validateBeforeSave: false });
        
        // Send OTP email
        const mailOptions = {
          from: process.env.SMTP_FROM,
          to: email,
          subject: 'Your Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>KEJANI HOMES - Verification Code</h2>
              <p>Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; text-align: center; margin: 20px 0;">
                ${otp}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <p> Made with love by Neon Hub Code House</p>
          `
        };
        
        try {
          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Email sending error:', emailError.message);
        }
      }
      
      return res.status(401).json({ 
        message: 'Please verify your email address first',
        isEmailVerified: false,
        email: user.email,
        otpToken: otpToken
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'emailVerification') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      email: decoded.email,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// OTP Verification
exports.verifyOTP = async (req, res) => {
  try {
    const { otp, otpToken } = req.body;
    
    if (!otp || !otpToken) {
      return res.status(400).json({ message: 'OTP and token are required' });
    }

    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'otpVerification') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      email: decoded.email,
      otp: otp,
      otpToken: otpToken,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpToken = undefined;
    user.otpExpires = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Check if there's an existing valid OTP
    if (user.otp && user.otpExpires && user.otpExpires > Date.now()) {
      // Resend existing OTP
      console.log('Resending existing OTP for:', email);
      console.log('Existing OTP:', user.otp);
      
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Your Verification Code - Resent',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>KEJANI HOMES - Verification Code</h2>
            <p>Your verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; text-align: center; margin: 20px 0;">
              ${user.otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <p> Made with love by Neon Hub Code House</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Existing OTP resent successfully to:', email);
      } catch (emailError) {
        console.error('Email sending error:', emailError.message);
      }

      return res.json({ 
        message: 'Verification code has been resent to your email',
        otpToken: user.otpToken,
        isExisting: true
      });
    }

    // Generate new OTP if existing one is expired or doesn't exist
    const { otp, otpToken } = user.generateOTP();
    await user.save({ validateBeforeSave: false });
    
    console.log('Sending new OTP to:', email);
    console.log('New OTP:', otp);
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your New Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>KEJANI HOMES - Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <p> Made with love by Neon Hub Code House</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('New OTP sent successfully to:', email);
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
    }

    res.json({ 
      message: 'New verification code has been sent to your email',
      otpToken: otpToken,
      isExisting: false
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error during resend OTP' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    console.log('Password reset request for:', req.body.email);
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const resetToken = user.generatePasswordResetToken();
    const expires = Date.now() + 900000; // 15 minutes
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(expires);
    
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #317E3D; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this password reset, you can ignore this email.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully to:', email);
    } catch (emailError) {
      console.error('Password reset email sending error:', emailError.message);
      return res.status(500).json({ message: 'Failed to send password reset email. Please try again.' });
    }

    res.json({ 
      message: 'Password reset email sent. Please check your inbox.',
      userId: user._id
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'passwordReset') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      email: decoded.email,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-favorites -bookings -messages');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    Object.assign(user, updates);
    await user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
