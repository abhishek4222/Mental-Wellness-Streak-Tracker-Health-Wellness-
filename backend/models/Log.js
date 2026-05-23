import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD format for timezone-safe comparisons
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  mood: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Ensure a single user doesn't duplicate logs for the same habit on the same date
LogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

export default mongoose.model('Log', LogSchema);
