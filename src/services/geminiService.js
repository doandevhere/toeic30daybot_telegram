import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateWordInfo(word) {
  const prompt = `Generate information about the English word "${word}" in the following JSON format:
  {
    "word": "the word",
    "pronunciation": "phonetic pronunciation",
    "partOfSpeech": "part of speech",
    "definition": "clear and concise definition",
    "vietnameseDefinition": "Vietnamese translation of the definition",
    "examples": ["3 example sentences using the word"],
    "vietnameseExamples": ["Vietnamese translation of each example sentence in the same order"],
    "synonyms": ["3-4 synonyms if applicable"]
  }
  Make sure the definition is clear and suitable for TOEIC preparation. Provide accurate Vietnamese translations.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    // Remove markdown code block if present
    text = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating word info:", error);
    throw error;
  }
}

export async function generateQuizQuestion(word, definition) {
  const prompt = `Generate a multiple choice question for the word "${word}" with definition "${definition}". 
  Return in this JSON format:
  {
    "question": "Complete the sentence: _____",
    "options": ["4 options with the correct answer included"],
    "correctAnswer": "the correct option",
    "explanation": "brief explanation why this is correct"
  }
  Make the question relevant to TOEIC exam style.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    // Remove markdown code block if present
    text = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating quiz question:", error);
    throw error;
  }
}

export async function generateRandomWord(learnedWords = []) {
  const prompt = `Generate a random English word suitable for TOEIC preparation that is not in the following list: ${learnedWords.join(
    ", "
  )}. Only provide the word, not an explanation.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    // Assuming the response is a simple word, not JSON
    return text;
  } catch (error) {
    console.error("Error generating random word:", error);
    throw error;
  }
}

export async function analyzeWordPairs(textContent) {
  const prompt = `Analyze this text content and identify important English word pairs that are useful for TOEIC preparation. Return the results in this JSON format:
  {
    "wordPairs": [
      {
        "pair": "word1 word2",
        "definition": "clear and concise definition",
        "vietnameseDefinition": "Vietnamese translation",
        "example": "example sentence using the pair",
        "vietnameseExample": "Vietnamese translation of example"
      }
    ]
  }
  
  Text content: ${textContent}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    // Remove markdown code block if present
    text = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing word pairs:", error);
    throw error;
  }
}
