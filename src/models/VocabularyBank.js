import mongoose from "mongoose";

const vocabularyBankSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  partOfSpeech: {
    type: String,
    required: true,
    default: 'unknown'
  },
  pronunciation: {
    type: String,
    required: true,
  },
  vietnameseMeaning: {
    type: String, 
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Static method to get random words
vocabularyBankSchema.statics.getRandomWords = async function(count = 1) {
  return this.aggregate([
    { $match: { isActive: true } },
    { $sample: { size: count } }
  ]);
};

const VocabularyBank = mongoose.model("VocabularyBank", vocabularyBankSchema);

export default VocabularyBank; 