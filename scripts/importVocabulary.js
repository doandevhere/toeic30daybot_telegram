import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { importVocabularyFromFile } from '../src/services/vocabularyService.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const result = await importVocabularyFromFile();
      console.log(result.message);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 