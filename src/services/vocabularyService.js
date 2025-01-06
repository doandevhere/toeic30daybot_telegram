import fs from 'fs';
import path from 'path';
import VocabularyBank from '../models/VocabularyBank.js';

/**
 * Import vocabulary from text file to database
 * @returns {Promise<{success: boolean, message: string, imported: number}>}
 */
export const importVocabularyFromFile = async () => {
  try {
    // Read the bank.text file
    const filePath = path.join(process.cwd(), 'bank.text');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Split content into words (non-empty lines)
    const words = fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('<'));

    let imported = 0;
    
    // Process each word
    for (const word of words) {
      try {
        // Check if word already exists
        const existingWord = await VocabularyBank.findOne({ word });
        
        if (!existingWord) {
          // Create new word entry with basic information
          await VocabularyBank.create({
            word,
            partOfSpeech: 'unknown', // Default value
            pronunciation: word, // Default value
            vietnameseMeaning: 'To be updated', // Default value
          });
          imported++;
        }
      } catch (err) {
        console.error(`Error processing word ${word}:`, err);
        continue;
      }
    }

    return {
      success: true,
      message: `Successfully imported ${imported} new words`,
      imported
    };

  } catch (error) {
    console.error('Error importing vocabulary:', error);
    return {
      success: false,
      message: error.message,
      imported: 0
    };
  }
} 