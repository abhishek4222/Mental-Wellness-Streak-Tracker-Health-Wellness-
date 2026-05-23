import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  icon: {
    type: String,
    default: '🧘'
  },
  color: {
    type: String,
    default: '#6C63FF'
  },
  target: {
    type: Number,
    default: null
  },
  currentProgress: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  notifyTime: {
    type: String,
    default: null
  },
  notifyEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Habit', HabitSchema);
