import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: [true, 'UserName already taken.'],
      required: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    isActive: {
      type: Boolean,
    },
    otp: {
      type: Number,
    },
    otpExpiration: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

// password bcrypt

userSchema.pre('save', async function (next) {
  // Check if password is modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (error) {
    return next(error);
  }
});

// check password correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate access token
userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

// generate refresh token
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};

export const User = mongoose.model('User', userSchema);
