import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
  },
  username: String,
  wordsLearned: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Word",
    },
  ],
  streakDays: {
    type: Number,
    default: 0,
  },
  lastStudyDate: {
    type: Date,
    default: Date.now,
  },
  quizStats: {
    totalAttempts: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
  },
});

// Update streak when user studies
userSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  const lastStudy = new Date(this.lastStudyDate);
  lastStudy.setHours(0, 0, 0, 0); // Set to start of day

  if (today.getTime() === lastStudy.getTime()) {
    // Already studied today, don't update streak
    return;
  }

  const diffTime = Math.abs(today - lastStudy);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day, increase streak
    this.streakDays += 1;
  } else if (diffDays > 1) {
    // Missed a day, reset streak
    this.streakDays = 1;
  }

  this.lastStudyDate = today;
};

const User = mongoose.model("User", userSchema);

export default User;
