const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendWelcome, sendOtp: sendOtpEmail } = require("../services/emailService");
const { sendSms } = require("../services/twilioService");

// Helper to generate a 6-digit numeric OTP
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, verificationMethod = "EMAIL" } = req.body;
    
    if (!name || !password) {
      return res.status(400).json({ success: false, message: "Name and password are required" });
    }

    if (verificationMethod === "EMAIL" && !email) {
      return res.status(400).json({ success: false, message: "Email is required for email verification" });
    }

    if (verificationMethod === "MOBILE" && !phone) {
      return res.status(400).json({ success: false, message: "Phone number is required for mobile verification" });
    }

    // Check duplicate
    const identifierQuery = verificationMethod === "EMAIL" ? { email } : { phone };
    let existingUser = await User.findOne(identifierQuery);
    
    if (existingUser) {
      if (existingUser.isVerified) {
        const fieldName = verificationMethod === "EMAIL" ? "email" : "mobile number";
        return res.status(409).json({
          success: false,
          message: `An account with this ${fieldName} already exists. Please login.`
        });
      } else {
        // Unverified user tries to register again -> regenerate OTP, update it and send
        const otp = generateOtpCode();
        existingUser.otp = otp;
        existingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        existingUser.verificationMethod = verificationMethod;
        if (name) existingUser.name = name;
        if (password) {
          existingUser.password = password; // Pass plaintext; User model pre-save hashes it
        }

        // Send OTP first to ensure no database state mismatches if transport fails
        try {
          if (verificationMethod === "EMAIL") {
            await sendOtpEmail(existingUser.email, otp);
          } else {
            await sendSms(existingUser.phone, `Your CommerceScale verification code is ${otp}. This code is valid for 10 minutes.`);
          }
        } catch (sendErr) {
          return res.status(400).json({
            success: false,
            message: sendErr.message || "Failed to send verification code. Please check credentials or try again."
          });
        }

        await existingUser.save();

        return res.status(200).json({
          success: true,
          verificationRequired: true,
          verificationMethod,
          email: existingUser.email,
          phone: existingUser.phone,
          message: "Account already exists but is not verified. A new OTP has been sent."
        });
      }
    }

    // Create new unverified user
    const otp = generateOtpCode();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Send OTP first to check credentials / config correctness
    try {
      if (verificationMethod === "EMAIL") {
        await sendOtpEmail(email, otp);
      } else {
        await sendSms(phone, `Your CommerceScale verification code is ${otp}. This code is valid for 10 minutes.`);
      }
    } catch (sendErr) {
      return res.status(400).json({
        success: false,
        message: sendErr.message || "Failed to send verification code. Please check credentials or try again."
      });
    }

    const user = await User.create({
      name,
      email: email || `${phone}@commerce-scale.local`,
      phone: phone || "",
      password, // Pass plaintext; User model pre-save hashes it
      role: "CUSTOMER",
      isVerified: false,
      isActive: true,
      verificationMethod,
      otp,
      otpExpires
    });

    console.log(`[AUTH DEBUG] Registration created user ID: ${user._id}. isVerified: false. OTP saved: ${otp}`);

    res.status(201).json({
      success: true,
      verificationRequired: true,
      verificationMethod,
      email: user.email,
      phone: user.phone,
      message: "Registration successful. An OTP has been sent."
    });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    let u;
    
    if (email) {
      u = await User.findOne({ email });
    } else if (phone) {
      u = await User.findOne({ phone });
    } else {
      return res.status(400).json({ success: false, message: "Email or mobile number is required" });
    }

    if (!u || !(await u.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Incorrect email/mobile number or password." });
    }

    // Check verification status
    if (!u.isVerified) {
      const otp = generateOtpCode();
      
      try {
        if (u.verificationMethod === "EMAIL") {
          await sendOtpEmail(u.email, otp);
        } else {
          await sendSms(u.phone, `Your CommerceScale verification code is ${otp}. This code is valid for 10 minutes.`);
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Failed to dispatch verification code. Please check credentials."
        });
      }

      u.otp = otp;
      u.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await u.save();

      return res.status(200).json({
        success: true,
        verificationRequired: true,
        verificationMethod: u.verificationMethod || "EMAIL",
        email: u.email,
        phone: u.phone,
        message: "Please verify your account first. An OTP has been sent."
      });
    }

    if (!u.isActive) {
      return res.status(403).json({ success: false, message: "Account disabled. Please contact support." });
    }

    res.json({
      success: true,
      data: {
        user: { id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, avatar: u.avatar },
        token: generateToken(u)
      }
    });
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res) => res.json({ success: true, data: { user: req.user } });

exports.forgotPassword = async (req, res) => res.json({ success: true, message: "Reset instructions sent." });

exports.resetPassword = async (req, res) => res.json({ success: true, message: "Reset password endpoint." });

exports.sendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    let u;
    
    if (email) {
      u = await User.findOne({ email });
    } else if (phone) {
      u = await User.findOne({ phone });
    }

    if (!u) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = generateOtpCode();

    try {
      if (u.verificationMethod === "EMAIL") {
        await sendOtpEmail(u.email, otp);
      } else {
        await sendSms(u.phone, `Your CommerceScale verification code is ${otp}. This code is valid for 10 minutes.`);
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to dispatch verification code."
      });
    }

    u.otp = otp;
    u.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await u.save();

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (e) {
    next(e);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    let u;
    if (email) {
      u = await User.findOne({ email });
    } else if (phone) {
      u = await User.findOne({ phone });
    }

    if (!u) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (u.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    if (!u.otp || u.otp !== otp || new Date() > u.otpExpires) {
      const msg = new Date() > u.otpExpires ? "OTP expired. Please request a new OTP." : "Invalid OTP. Please try again.";
      return res.status(400).json({ success: false, message: msg });
    }

    u.otp = null;
    u.otpExpires = null;
    u.isVerified = true;
    await u.save();

    console.log(`[AUTH DEBUG] OTP successfully verified for ID: ${u._id}. isVerified: true`);

    res.json({
      success: true,
      message: "Account verified successfully. Please login."
    });
  } catch (e) {
    next(e);
  }
};
