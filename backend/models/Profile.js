import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 0
  },
  unlockedBadges: {
    type: [String],
    default: []
  },
  freezes: {
    type: Number,
    default: 0
  },
  lastFreezeAward: {
    type: String,
    default: ''
  },
  streakData: {
    type: Map,
    of: Number,
    default: {}
  },
  longestStreaks: {
    type: Map,
    of: Number,
    default: {}
  },
  totalCompletions: {
    type: Number,
    default: 0
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  purchasedThemes: {
    type: [String],
    default: ['midnight_oasis'] // Default initial theme
  },
  activeTheme: {
    type: String,
    default: 'midnight_oasis'
  },
  purchasedFrames: {
    type: [String],
    default: ['none']
  },
  activeFrame: {
    type: String,
    default: 'none'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Profile', ProfileSchema);
