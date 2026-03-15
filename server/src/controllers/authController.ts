import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Only these emails may access doctor or admin roles
const DOCTOR_EMAILS = ['samridhsen9@gmail.com'];
const ADMIN_EMAILS: string[] = [];
const PRIVILEGED_EMAILS = [...DOCTOR_EMAILS, ...ADMIN_EMAILS];

// ---------- TOKEN HELPERS ----------

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateAccessToken(userId: string, role: string): string {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken(userId: string, role: string): string {
  return jwt.sign(
    { id: userId, role, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

function generateTokenPair(userId: string, role: string) {
  return {
    accessToken: generateAccessToken(userId, role),
    refreshToken: generateRefreshToken(userId, role),
  };
}

// ---------- REGISTER ----------

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, role, ...additionalData } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let assignedRole = role || 'patient';
    if ((assignedRole === 'doctor' || assignedRole === 'admin') && !PRIVILEGED_EMAILS.includes(email)) {
      assignedRole = 'patient';
    }

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: assignedRole,
      ...additionalData,
    });

    await newUser.save();

    const tokens = generateTokenPair(newUser._id.toString(), newUser.role);

    res.status(201).json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ---------- LOGIN ----------

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const tokens = generateTokenPair(user._id.toString(), user.role);

    res.status(200).json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ---------- GOOGLE AUTH ----------

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ message: 'Invalid Google Token payload' });
      return;
    }

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(googleId + (process.env.JWT_SECRET || 'secret'), salt);

      let assignedRole = 'patient';
      if (ADMIN_EMAILS.includes(email!)) assignedRole = 'admin';
      else if (DOCTOR_EMAILS.includes(email!)) assignedRole = 'doctor';

      user = new User({
        fullName: name || 'Google User',
        email,
        password: hashedPassword,
        role: assignedRole,
      });
      await user.save();
    }

    const tokens = generateTokenPair(user._id.toString(), user.role);

    res.status(200).json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error.message);
    res.status(500).json({ message: 'Server error during Google Authentication' });
  }
};

// ---------- REFRESH TOKEN ----------

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(401).json({ message: 'No refresh token provided' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret'
    ) as any;

    if (decoded.type !== 'refresh') {
      res.status(401).json({ message: 'Invalid token type' });
      return;
    }

    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Issue new access token (and optionally rotate refresh token)
    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString(), user.role);

    res.status(200).json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
};

// ---------- GET ALL PATIENTS ----------

export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.status(200).json({ patients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching patients' });
  }
};
