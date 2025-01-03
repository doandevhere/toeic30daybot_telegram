import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  definition: {
    type: String,
    required: true,
  },
  vietnameseDefinition: {
    type: String,
    required: true,
  },
  pronunciation: String,
  partOfSpeech: String,
  examples: [String],
  vietnameseExamples: [String],
  synonyms: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
});

const Word = mongoose.model("Word", wordSchema);

// Add compound index for word and userId
wordSchema.index({ word: 1, userId: 1 }, { unique: true });

export default Word;
