import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Habit from './models/Habit.js';
import Log from './models/Log.js';
import Profile from './models/Profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

mongoose.set('strictQuery', false);

// MongoDB connection settings
const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/wellness_streak';
const MONGO_URI = process.env.MONGO_URI || DEFAULT_MONGO_URI;
let lastDbError = null;

const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    lastDbError = null;
    console.log(`✨ Connected to MongoDB successfully at ${MONGO_URI}`);
  } catch (err) {
    lastDbError = err;
    console.error('❌ MongoDB connection error:', err);
    if (MONGO_URI !== DEFAULT_MONGO_URI) {
      console.log(`⚠️ Retrying fallback to local database: ${DEFAULT_MONGO_URI}`);
      try {
        await mongoose.connect(DEFAULT_MONGO_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        lastDbError = null;
        console.log('✨ Connected to local MongoDB fallback successfully.');
      } catch (fallbackErr) {
        lastDbError = fallbackErr;
        console.error('❌ Local MongoDB fallback connection failed:', fallbackErr);
      }
    }
  }
};

connectDb();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me_9182391';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const OTP_BYPASS_CODE = process.env.OTP_BYPASS_CODE || '123456';

// Middleware for JWT Verification
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token' });
    }
    req.user = decoded;
    next();
  });
};

// Mail transporter configuration for alerts/OTPs
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log('✅ SMTP Email Transporter ready.'))
  .catch(() => console.log('⚠️ SMTP Email Transporter not configured. Using local OTP console log logging.'));

// Verification OTP cache (in-memory)
const pendingOtps = new Map();

// API STATUS
app.get('/api/status', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  res.json({
    database: states[state] || 'unknown',
    uptime: process.uptime(),
    timestamp: new Date(),
    error: lastDbError ? String(lastDbError.message || lastDbError) : undefined,
  });
});

// AUTHENTICATION
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    pendingOtps.set(normalizedEmail, { name, passwordHash, otp, expiresAt });
    console.log(`🔑 Generated verification OTP code for ${normalizedEmail}: [${otp}] (Local Bypass Available: ${OTP_BYPASS_CODE})`);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'wellness@streaktracker.com',
      to: normalizedEmail,
      subject: 'Mental Wellness Streak Tracker - Verification Code',
      text: `Your wellness verification code is ${otp}. It expires in 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 12px; background-color: #f7f6ff; color: #333;">
        <h2 style="color: #6C63FF;">Verify Your Streak Account</h2>
        <p>Welcome to your wellness journey! Use the verification code below to activate your streak profile:</p>
        <div style="font-size: 28px; font-weight: bold; background: #6C63FF; color: white; display: inline-block; padding: 10px 24px; border-radius: 8px; margin: 15px 0; letter-spacing: 4px;">${otp}</div>
        <p style="font-size: 12px; color: #777;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>`,
    };

    // Attempt sending email. If SMTP fails, we gracefully allow frontend local signup using bypass code.
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.warn('⚠️ Nodemailer: SMTP delivery failed. Registration cached for local bypass evaluation.');
        return res.json({ 
          message: 'Registration initiated.', 
          note: 'SMTP email failed. Please use local development bypass OTP code to complete sign-up.' 
        });
      }
      return res.json({ message: 'Verification OTP sent to email successfully.' });
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to initialize account registration.' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and verification OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cachedEntry = pendingOtps.get(normalizedEmail);

    if (!cachedEntry) {
      return res.status(400).json({ error: 'No active registration request found for this email address.' });
    }

    if (Date.now() > cachedEntry.expiresAt) {
      pendingOtps.delete(normalizedEmail);
      return res.status(400).json({ error: 'Verification code has expired. Please sign up again.' });
    }

    // Check code matches cached OTP or matches the environment override code
    const isBypass = String(otp) === OTP_BYPASS_CODE;
    const isMatched = String(otp) === String(cachedEntry.otp);

    if (!isBypass && !isMatched) {
      return res.status(400).json({ error: 'Incorrect verification OTP code.' });
    }

    // Validation complete, save User
    const user = new User({
      name: cachedEntry.name,
      email: normalizedEmail,
      passwordHash: cachedEntry.passwordHash,
    });
    await user.save();
    pendingOtps.delete(normalizedEmail);

    // Bootstrap user Profile
    const profile = new Profile({
      userId: user._id,
      xp: 0,
      level: 1,
      freezes: 1, // Start with 1 freeze
      unlockedBadges: [],
      purchasedThemes: ['midnight_oasis'],
      activeTheme: 'midnight_oasis',
    });
    await profile.save();

    // Sign Auth Token
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
      profile
    });

  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.status(500).json({ error: 'An error occurred during verification.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server authentication failure.' });
  }
});

// HABITS ROUTES
app.get('/api/habits', authenticateJWT, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load habits.' });
  }
});

app.post('/api/habits', authenticateJWT, async (req, res) => {
  try {
    const newHabit = new Habit({
      ...req.body,
      userId: req.user.id,
    });
    const saved = await newHabit.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add habit schema.' });
  }
});

app.put('/api/habits/:id', authenticateJWT, async (req, res) => {
  try {
    const updated = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Habit record not found.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update habit details.' });
  }
});

app.delete('/api/habits/:id', authenticateJWT, async (req, res) => {
  try {
    const deleted = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ error: 'Habit record not found.' });
    }
    // Delete associated progress history
    await Log.deleteMany({ habitId: req.params.id, userId: req.user.id });
    res.json({ message: 'Habit and corresponding logs cleaned successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete habit.' });
  }
});

// DAILY PROGRESS LOGS ROUTES
app.get('/api/logs', authenticateJWT, async (req, res) => {
  try {
    const { date, habitId } = req.query;
    const searchFilter = { userId: req.user.id };
    if (date) searchFilter.date = date;
    if (habitId) searchFilter.habitId = habitId;

    const list = await Log.find(searchFilter);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve logs.' });
  }
});

app.post('/api/logs/upsert', authenticateJWT, async (req, res) => {
  try {
    const { habitId, date, completed, progress, mood, isFrozen } = req.body;
    if (!habitId || !date) {
      return res.status(400).json({ error: 'habitId and date are required parameters.' });
    }

    const updates = { completed, progress };
    if (mood !== undefined) updates.mood = mood;
    if (isFrozen !== undefined) updates.isFrozen = isFrozen;

    const upserted = await Log.findOneAndUpdate(
      { userId: req.user.id, habitId, date },
      { $set: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(upserted);
  } catch (err) {
    res.status(400).json({ error: 'Failed to save progress log.' });
  }
});

// PROFILE ROUTES
app.get('/api/profile', authenticateJWT, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new Profile({ userId: req.user.id });
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profiles.' });
  }
});

app.put('/api/profile', authenticateJWT, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new Profile({ userId: req.user.id });
    }

    // Direct object key-mapping exclusion list
    const fieldsToUpdate = req.body;
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (key !== 'userId' && key !== '_id') {
        profile[key] = fieldsToUpdate[key];
      }
    });

    profile.updatedAt = new Date();
    const savedProfile = await profile.save();
    res.json(savedProfile);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(400).json({ error: 'Failed to update profile settings.' });
  }
});

export default app;
